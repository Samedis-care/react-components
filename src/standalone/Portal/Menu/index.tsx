import React, { Dispatch, SetStateAction, useState } from "react";
import { MenuContext, toMenuItemComponent } from "./MenuItem";
import { Theme } from "@mui/material/styles";
import { makeStyles, CSSProperties } from "@mui/styles";
import { SvgIconComponent } from "@mui/icons-material";
import { combineClassNames } from "../../../utils";
import { SvgIconProps } from "@mui/material";

/**
 * Properties of the Wrapper
 */
export interface IMenuWrapperProps {
	/**
	 * The actual menu entries
	 */
	children: React.ReactNode;
}

/**
 * Properties of a menu item component
 */
export interface MenuItemProps {
	/**
	 * An optional icon
	 */
	icon?: SvgIconComponent | React.ComponentType<SvgIconProps>;
	/**
	 * The text of the menu entry
	 */
	title: string;
	/**
	 * The onClick handler
	 */
	onClick: React.MouseEventHandler;
	/**
	 * Middle-click handler
	 */
	onAuxClick: React.MouseEventHandler;
	/**
	 * Is this menu entry expandable? (does it have children?)
	 */
	expandable: boolean;
	/**
	 * Is this menu item currently selected/active
	 */
	active?: boolean; // set if expandable == false
	/**
	 * Is this menu item currently expanded
	 */
	expanded?: boolean; // set if expandable == true
	/**
	 * The depth in the menu tree
	 */
	depth: number;
}

/**
 * The menu item definition
 */
export interface IMenuItemDefinition {
	/**
	 * The icon of the menu item
	 */
	icon?: SvgIconComponent | React.ComponentType<SvgIconProps>;
	/**
	 * The text of the menu item
	 */
	title: string;
	/**
	 * The click handler of the menu item
	 */
	onClick: React.MouseEventHandler;
	/**
	 * Middle-click handler
	 */
	onAuxClick?: React.MouseEventHandler;
	/**
	 * Should this menu item be rendered? Useful for permission checks
	 */
	shouldRender: boolean;
	/**
	 * Should this entry forcibly expand? Used by RoutedMenu to auto-expand
	 */
	forceExpand?: boolean;
	/**
	 * The children of this menu entry
	 */
	children?: IMenuItemDefinition[];
}

export type MenuItemComponent = React.ComponentType<MenuItemProps>;

/**
 * The menu properties
 */
export interface MenuProps {
	/**
	 * The definition of the menu items
	 */
	definition: IMenuItemDefinition[];
	/**
	 * The wrapper element wrapping the menu items
	 */
	wrapper: React.ElementType<IMenuWrapperProps>;
	/**
	 * The menu item renderer component
	 */
	menuItem: MenuItemComponent;
	/**
	 * The class name to assign to the div wrapping the Wrapper
	 */
	className?: string;
	/**
	 * The class name to assign to the collapse wrapping the children of menu items
	 */
	childWrapperClassName?: string;
	/**
	 * Custom state which can be used to control the active menu entry
	 * Contains a string concatenated from menu item depth (zero based) and the menu item title
	 */
	customState?: [string, Dispatch<SetStateAction<string>>];
	/**
	 * Custom styles
	 */
	classes?: Partial<ReturnType<typeof useStyles>>;
}

export interface MenuTheme {
	container?: {
		padding?: CSSProperties["padding"];
		height?: CSSProperties["height"];
		width?: CSSProperties["width"];
		overflow?: CSSProperties["overflow"];
		style?: CSSProperties;
	};
}

const useStyles = makeStyles(
	(theme: Theme) => ({
		root: {
			padding: theme.componentsCare?.portal?.menu?.container?.padding,
			height: theme.componentsCare?.portal?.menu?.container?.height || "100%",
			width: theme.componentsCare?.portal?.menu?.container?.width || "100%",
			overflow:
				theme.componentsCare?.portal?.menu?.container?.overflow || "auto",
			...theme.componentsCare?.portal?.menu?.container?.style,
		},
	}),
	{ name: "CcPortalMenu" }
);

const PortalMenu = (props: MenuProps) => {
	const Wrapper = props.wrapper;
	const state = useState("");
	const classes = useStyles(props);

	return (
		<div className={combineClassNames([classes.root, props.className])}>
			<Wrapper>
				<MenuContext.Provider value={props.customState || state}>
					{props.definition.map((child) =>
						toMenuItemComponent(props, child, 0, null)
					)}
				</MenuContext.Provider>
			</Wrapper>
		</div>
	);
};

export default React.memo(PortalMenu);
