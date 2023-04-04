import React, { Dispatch, SetStateAction, CSSProperties } from "react";
import { SvgIconComponent } from "@material-ui/icons";
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
    icon?: SvgIconComponent;
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
    active?: boolean;
    /**
     * Is this menu item currently expanded
     */
    expanded?: boolean;
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
    icon?: SvgIconComponent;
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
export declare type MenuItemComponent = React.ComponentType<MenuItemProps>;
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
declare const useStyles: (props?: any) => import("@material-ui/styles").ClassNameMap<"root">;
declare const _default: React.MemoExoticComponent<(props: MenuProps) => JSX.Element>;
export default _default;
