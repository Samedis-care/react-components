import React, {
	Dispatch,
	SetStateAction,
	useCallback,
	useContext,
	useState,
} from "react";
import { IMenuItemDefinition, MenuItemProps, MenuProps } from "./index";
import { Collapse } from "@material-ui/core";
interface IProps extends Omit<MenuItemProps, "expanded" | "active"> {
	/**
	 * The menu item renderer properties
	 */
	menuProps: MenuProps;
	/**
	 * The menu item children definitions
	 */
	childDefs?: IMenuItemDefinition[];
	/**
	 * The class name assigned to the collapse wrapping the menu item children
	 */
	childWrapperClassName?: string;
	/**
	 * Should the menu item force expand if expandable?
	 */
	forceExpand: boolean;
}

/**
 * Context for the menu state
 */
export const MenuContext = React.createContext<
	[string, Dispatch<SetStateAction<string>>] | undefined
>(undefined);

const MenuItem = (props: IProps) => {
	const { depth, title, expandable, forceExpand, onClick } = props;
	const [expanded, setExpanded] = useState(false);
	const menuContext = useContext(MenuContext);
	if (!menuContext) throw new Error("MenuContext is undefined");
	const [menuState, setMenuState] = menuContext;

	const clickProxy = useCallback(() => {
		if (expandable) setExpanded(forceExpand ? true : (prevFlag) => !prevFlag);
		else setMenuState(`${depth}${title}`);
		onClick();
	}, [expandable, forceExpand, onClick, setMenuState, depth, title]);

	// force expand
	if (expandable && !expanded && forceExpand) {
		setExpanded(true);
	}

	const Renderer = props.menuProps.menuItem;
	return (
		<>
			<Renderer
				icon={props.icon}
				title={title}
				expandable={expandable}
				expanded={expandable ? expanded : undefined}
				active={expandable ? undefined : menuState === `${depth}${title}`}
				onClick={clickProxy}
				depth={depth}
			/>
			{expandable && (
				<Collapse in={expanded} className={props.childWrapperClassName}>
					{props.childDefs?.map((child) =>
						toMenuItemComponent(props.menuProps, child, depth + 1)
					)}
				</Collapse>
			)}
		</>
	);
};

export default React.memo(MenuItem);

export const toMenuItemComponent = (
	menuProps: MenuProps,
	def: IMenuItemDefinition,
	depth: number
): JSX.Element | false =>
	def.shouldRender && (
		<MenuItem
			key={`${depth}${def.title}`}
			icon={def.icon}
			title={def.title}
			expandable={!!(def.children && def.children.length > 0)}
			onClick={def.onClick}
			menuProps={menuProps}
			childDefs={def.children}
			forceExpand={!!def.forceExpand}
			depth={depth}
			childWrapperClassName={menuProps.childWrapperClassName}
		/>
	);
