import React, {
	Dispatch,
	SetStateAction,
	useCallback,
	useContext,
	useState,
} from "react";
import { IMenuItemDefinition, MenuItemProps, MenuProps } from "./index";
import { Collapse } from "@mui/material";

interface MenuItemControllerProps
	extends Omit<MenuItemProps, "expanded" | "active"> {
	/**
	 * The menu item renderer properties
	 */
	menuProps: MenuProps;
	/**
	 * The id of the menu item (used for marking active item)
	 */
	menuItemId: string;
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

const MenuItem = (props: MenuItemControllerProps) => {
	const {
		depth,
		title,
		expandable,
		forceExpand,
		onClick,
		onAuxClick,
		menuItemId,
	} = props;
	const [expanded, setExpanded] = useState(false);
	const menuContext = useContext(MenuContext);
	if (!menuContext) throw new Error("MenuContext is undefined");
	const [menuState, setMenuState] = menuContext;

	const clickProxy = useCallback(
		(evt: React.MouseEvent) => {
			if (expandable) setExpanded(forceExpand ? true : (prevFlag) => !prevFlag);
			else setMenuState(menuItemId);
			onClick(evt);
		},
		[expandable, forceExpand, setMenuState, menuItemId, onClick],
	);

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
				active={expandable ? undefined : menuState === menuItemId}
				onClick={clickProxy}
				onAuxClick={onAuxClick}
				depth={depth}
			/>
			{expandable && (
				<Collapse in={expanded} className={props.childWrapperClassName}>
					{props.childDefs?.map((child) =>
						toMenuItemComponent(props.menuProps, child, depth + 1, menuItemId),
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
	depth: number,
	menuItemId: string | null,
): JSX.Element | false =>
	def.shouldRender && (
		<MenuItem
			key={menuItemId ? `${menuItemId}@${def.title}` : def.title}
			menuItemId={menuItemId ? `${menuItemId}@${def.title}` : def.title}
			icon={def.icon}
			title={def.title}
			expandable={!!(def.children && def.children.length > 0)}
			onClick={def.onClick}
			onAuxClick={def.onAuxClick ?? (() => undefined)}
			menuProps={menuProps}
			childDefs={def.children}
			forceExpand={!!def.forceExpand}
			depth={depth}
			childWrapperClassName={menuProps.childWrapperClassName}
		/>
	);
