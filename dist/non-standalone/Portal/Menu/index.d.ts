import React from "react";
import { IMenuItemDefinition, MenuProps } from "../../../standalone/Portal/Menu";
export interface IRoutedMenuItemDefinition extends Omit<IMenuItemDefinition, "onClick" | "children"> {
    /**
     * The URL to navigate to in case the menu item is clicked
     *
     * Its `:name` params are filled from the current URL, read with the route
     * of the whole menu tree (any level) that matches the URL best: an exact
     * match first, otherwise the longest route that matches as a prefix. On
     * `/projects/42/review`, `/projects/:id/capture` navigates to
     * `/projects/42/capture`. While the current URL has no value for one of
     * its params, the entry is hidden (with its children), as if
     * `shouldRender` were false, and in development a `console.error` names
     * the entry and the param (once per menu, entry and param). An entry meant
     * only for pages that provide its params gets `shouldRender: false` on the
     * other pages from the app.
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
export declare const useRoutedMenuLogic: (props: Pick<IRoutedMenuProps, "definition">) => {
    definition: IMenuItemDefinition[];
    controlledState: [string, React.Dispatch<React.SetStateAction<string>>];
};
declare const _default: React.MemoExoticComponent<(props: IRoutedMenuProps) => React.JSX.Element>;
export default _default;
