import React from "react";
import { IMenuItemDefinition, MenuProps } from "../../../standalone/Portal/Menu";
export interface IRoutedMenuItemDefinition extends Omit<IMenuItemDefinition, "onClick" | "children"> {
    /**
     * The URL to navigate to in case the menu item is clicked
     */
    route?: string;
    /**
     * An additional onClick action to be executed
     */
    onClick?: React.MouseEventHandler;
    /**
     * Children of this menu entry
     */
    children?: IRoutedMenuItemDefinition[];
}
export interface IRoutedMenuProps extends Omit<MenuProps, "definition" | "customState"> {
    /**
     * The menu definition (with routing support)
     */
    definition: IRoutedMenuItemDefinition[];
}
declare const _default: React.MemoExoticComponent<(props: IRoutedMenuProps) => JSX.Element>;
export default _default;
