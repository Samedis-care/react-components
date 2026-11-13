import React from "react";
import { IMenuItemDefinition, MenuProps } from "../../../standalone/Portal/Menu";
export interface IRoutedMenuItemDefinition extends Omit<IMenuItemDefinition, "onClick" | "children"> {
    /**
     * The URL to navigate to in case the menu item is clicked
     *
     * The route also decides when the entry is highlighted. It matches the
     * current URL as a prefix: `/devices` matches `/devices/5/edit` (`/`
     * matches only `/`). When several entries of the menu tree match, at any
     * level and in any group, the most specific one is highlighted and the
     * groups above it are expanded: an exact match before a prefix match, then
     * the route with more segments, then, segment by segment from the left, a
     * literal before a `:name` param (`/apps/new` before `/apps/:app`). On a
     * tie the deeper entry wins (a group's entry with the group's own route),
     * then the earlier one.
     *
     * Its `:name` params are filled from the current URL, read with the route
     * of that best-matching entry: on `/projects/42/review`,
     * `/projects/:id/capture` navigates to `/projects/42/capture`. While the
     * current URL has no value for one of its params, the entry is hidden
     * (with its children), as if `shouldRender` were false, and in development
     * a `console.error` names the entry and the param (once per menu, entry
     * and param). An entry meant only for pages that provide its params gets
     * `shouldRender: false` on the other pages from the app.
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
