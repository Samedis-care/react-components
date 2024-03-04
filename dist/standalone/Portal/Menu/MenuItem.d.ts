import React from "react";
import type { IMenuItemDefinition, MenuItemProps, MenuProps } from "./index";
interface MenuItemControllerProps extends Omit<MenuItemProps, "expanded" | "active"> {
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
export declare const MenuContext: React.Context<[string, React.Dispatch<React.SetStateAction<string>>] | undefined>;
declare const _default: React.MemoExoticComponent<(props: MenuItemControllerProps) => React.JSX.Element>;
export default _default;
export declare const toMenuItemComponent: (menuProps: MenuProps, def: IMenuItemDefinition, depth: number, menuItemId: string | null) => JSX.Element | false;
