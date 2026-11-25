import React from "react";
import { IMenuItemDefinition, MenuProps } from "../../../standalone/Portal/Menu";
export interface IRoutedMenuItemDefinition extends Omit<IMenuItemDefinition, "onClick" | "children"> {
    /**
     * The URL to navigate to in case the menu item is clicked
     *
     * A path of the app, such as `/devices`, `/apps/:app/roles`, `/devices/*`
     * or `/tasks?tab=open`, not a URL (open an external page from `onClick`).
     * Its path decides when the entry is highlighted, and the same path, with
     * its params filled in, is where a click goes:
     * - A trailing `/*`, the form a parent Route's path takes, is not part of
     *   the target: `/devices/*` is highlighted where `/devices` is and
     *   navigates to `/devices`.
     * - A search and a hash go into the target and play no part in the
     *   highlight: `/tasks?tab=open` navigates to `/tasks?tab=open` and is
     *   highlighted on `/tasks` with any search, so entries that differ only in
     *   their search or hash match the same pages. The current URL's search and
     *   hash are not kept.
     * - A route without a leading slash is relative to the Route the menu is
     *   rendered in. Inside `<Route path="/apps/:app/*">`, `users` is
     *   highlighted on `/apps/a1/users` and navigates there from every page
     *   below `/apps/a1`, including pages that no entry matches. Outside of any
     *   Route it is the same as `/users`.
     *
     * The route matches the current URL as a prefix: `/devices` matches
     * `/devices/5/edit` (`/` matches only `/`). When several entries of the
     * menu tree match, at any level and in any group, the most specific one is
     * highlighted and the groups above it are expanded: an exact match before
     * a prefix match, then the route with more segments, then, segment by
     * segment from the left, a literal before a `:name` param (`/apps/new`
     * before `/apps/:app`), then a route without a trailing `/*` before one
     * with. On a tie the deeper entry wins (a group's entry with the group's
     * own route), then the earlier one. The highlight follows the URL only: on
     * a path that no entry matches, nothing is highlighted, and an entry
     * without `route` (an action such as "Log out") is never highlighted.
     *
     * Its `:name` params are filled from the current URL, read with the route
     * of that best-matching entry: on `/projects/42/review`,
     * `/projects/:id/capture` navigates to `/projects/42/capture`. The values
     * go in percent-encoded, so a value with "/" stays one segment. While the
     * current URL has no value for one of its params, the entry is hidden
     * (with its children), as if `shouldRender` were false, and in development
     * a `console.error` names the entry and the param (once per menu, entry
     * and param). An entry meant only for pages that provide its params gets
     * `shouldRender: false` on the other pages from the app. The part of a
     * relative route that stands for the enclosing Route is taken from the
     * current URL as that Route matched it.
     */
    route?: string;
    /**
     * Keeps the group expanded on every page
     *
     * Default `false`: RoutedMenu expands a group by itself while the entry of
     * the current URL is inside it. With `true` the group is expanded on the
     * other pages too. While a group is expanded this way, a click on it does
     * not collapse it (MenuBase). No effect on an entry without children.
     */
    forceExpand?: boolean;
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
/**
 * The routing logic of RoutedMenu, for a menu the app renders itself. Must be
 * called inside a HistoryRouter; called inside a Route, the routes without a
 * leading slash are relative to that Route (see IRoutedMenuItemDefinition's
 * `route`).
 * @param props The menu definition
 * @return `definition`: the entries converted for MenuBase, with
 * `forceExpand` set on the groups above the entry of the current URL (and
 * kept on the entries that set it themselves) and handlers that navigate to
 * the entries' routes. `controlledState`: for
 * MenuBase's `customState` or a `MenuContext.Provider`, the id of the entry
 * of the current URL (the titles from the top level joined by `@`, `""` when
 * no entry matches the URL) and a setter that does nothing, because the
 * active entry follows the URL only.
 */
export declare const useRoutedMenuLogic: (props: Pick<IRoutedMenuProps, "definition">) => {
    definition: IMenuItemDefinition[];
    controlledState: [string, React.Dispatch<React.SetStateAction<string>>];
};
declare const _default: React.MemoExoticComponent<(props: IRoutedMenuProps) => React.JSX.Element>;
export default _default;
