import React, {
	Dispatch,
	SetStateAction,
	useCallback,
	useContext,
	useState,
} from "react";
import { IMenuItemDefinition, IMenuItemProps, IMenuProps } from "./index";
import { Collapse } from "@material-ui/core";

interface IProps extends Omit<IMenuItemProps, "expanded" | "active"> {
	menuProps: IMenuProps;
	childDefs?: IMenuItemDefinition[];
	childWrapperClassName?: string;
}

export const MenuContext = React.createContext<
	[string, Dispatch<SetStateAction<string>>] | undefined
>(undefined);

export const MenuItem = (props: IProps) => {
	const { depth, title, expandable, onClick } = props;
	const [flag, setFlag] = useState(false);
	const [menuState, setMenuState] = useContext(MenuContext)!;
	const clickProxy = useCallback(() => {
		if (expandable) setFlag((prevFlag) => !prevFlag);
		else setMenuState(depth + title);
		onClick();
	}, [expandable, onClick, setMenuState, depth, title]);

	const Renderer = props.menuProps.menuItem;
	return (
		<>
			<Renderer
				icon={props.icon}
				title={title}
				expandable={expandable}
				expanded={expandable ? flag : undefined}
				active={expandable ? undefined : menuState === depth + title}
				onClick={clickProxy}
				depth={depth}
			/>
			{expandable && (
				<Collapse in={flag} className={props.childWrapperClassName}>
					{props.childDefs?.map((child) =>
						toMenuItemComponent(props.menuProps, child, depth + 1)
					)}
				</Collapse>
			)}
		</>
	);
};

export const toMenuItemComponent = (
	menuProps: IMenuProps,
	def: IMenuItemDefinition,
	depth: number
): JSX.Element | false =>
	def.shouldRender && (
		<MenuItem
			key={depth + def.title}
			icon={def.icon}
			title={def.title}
			expandable={!!(def.children && def.children.length > 0)}
			onClick={def.onClick}
			menuProps={menuProps}
			childDefs={def.children}
			depth={depth}
			childWrapperClassName={menuProps.childWrapperClassName}
		/>
	);
