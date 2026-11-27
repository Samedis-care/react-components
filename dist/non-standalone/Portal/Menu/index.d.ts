import React, { Dispatch, SetStateAction } from "react";
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
     *   hash are not kept: on `/users?page=2#list`, a click on `/users` goes to
     *   `/users`, and Back returns to `/users?page=2#list`.
     * - A route without a leading slash is relative to the Route the menu is
     *   rendered in. Inside `<Route path="/apps/:app/*">`, `users` is
     *   highlighted on `/apps/a1/users` and navigates there from every page
     *   below `/apps/a1`, including pages that no entry matches. Outside of any
     *   Route it is the same as `/users`.
     *
     * A click whose target is the current location (the same pathname, search
     * and hash, as the URL parser reads them) replaces the history entry
     * instead of pushing a second one, as a plain link does in a browser and as
     * `Link` does: clicking the entry of the current page any number of times
     * leaves one entry for it, so a single Back leaves the page. The page still
     * scrolls to the top, as after every navigation.
     *
     * The route matches the current URL as a prefix: `/devices` matches
     * `/devices/5/edit` (`/` matches only `/`). A home entry under a base
     * path, such as `/tenant/abc/`, therefore matches every page below it:
     * give it `end` to match its own path only. When several entries of the
     * menu tree match, at any level and in any group, the most specific one is
     * highlighted and the groups above it are expanded: an exact match before
     * a prefix match, then the route with more segments, then, segment by
     * segment from the left, a literal before a `:name` param (`/apps/new`
     * before `/apps/:app`), then a route without a trailing `/*` before one
     * with, the order by which `Routes` picks the route it renders. On a tie
     * the deeper entry wins, then the earlier one. The highlight follows the
     * URL only: on a path that no entry matches, nothing is highlighted, and an
     * entry without `route` (an action such as "Log out") is never highlighted.
     *
     * Only an entry the menu shows is highlighted. An entry is hidden by its
     * own `shouldRender: false`, by that of a group above it, and while the
     * current URL has no value for one of its params (see below). On the page
     * of a hidden entry, the most specific shown entry that matches is
     * highlighted: "Projects" (`/projects`) on `/projects/7/capture`, the page
     * of a hidden `/projects/:id/capture`. On a page that only hidden entries
     * match, nothing is highlighted and no group is expanded, but the best of
     * them is still the entry of the current URL for useRoutedMenuLogic: its
     * active id, and `containsCurrent` on the groups above it, so a menu the
     * app renders can mark the section the page belongs to.
     *
     * Its `:name` params are filled from the current URL, read with the route
     * that matches it best as a prefix, a hidden entry's and one with `end`
     * too: on `/projects/42/capture`,
     * the page of a hidden `/projects/:id/capture`, `/projects/:id/review`
     * navigates to `/projects/42/review`. The values go in percent-encoded, so
     * a value with "/" stays one segment. While the current URL has no value
     * for one of its params, the entry is hidden (with its children), as if
     * `shouldRender` were false, and in development a `console.error` names
     * the entry and the param (once per menu, entry and param). An entry meant
     * only for pages that provide its params gets `shouldRender: false` on the
     * other pages from the app. The part of a relative route that stands for
     * the enclosing Route is taken from the current URL as that Route matched
     * it.
     *
     * Not for a group (an entry with `children`): a group only shows and hides
     * its entries, and its `route` is ignored. Give the group's page an entry
     * among its children instead, e.g. "Overview" with the route `/settings`.
     */
    route?: string;
    /**
     * Matches `route` with the whole current path only, not as a prefix
     *
     * Default `false`: the entry is highlighted on its route's path and the
     * pages below it (see `route`). With `true`, as a Route with `end`, only on
     * its own path: `/tenant/abc/` is highlighted on `/tenant/abc` and
     * `/tenant/abc/`, but not on `/tenant/abc/profile`. For a home entry under
     * a base path, which every other route of the menu lies below: matched as
     * a prefix, it is highlighted on every page below the base path that no
     * shown entry matches more specifically. The route `/` matches only `/`
     * either way, and a trailing `/*` still matches the rest.
     *
     * On a page below its route, the entry is not the entry of the current URL
     * (neither highlighted nor `current` for useRoutedMenuLogic), but its route
     * still reads the params of the URL for the other entries: with `end`,
     * `/apps/:app` is not highlighted on `/apps/a1/history`, and
     * `/apps/:app/roles` there still navigates to `/apps/a1/roles`. No effect on
     * a group (its `route` is ignored) or on an entry without `route`.
     */
    end?: boolean;
    /**
     * Keeps the group expanded on every page
     *
     * Default `false`: RoutedMenu expands a group by itself while the
     * highlighted entry of the current URL is inside it (not for an entry the
     * menu hides, see `route`). With `true` the group is expanded on the
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
     *
     * An entry with at least one child is a group: a click, Enter or Space
     * expands or collapses it and runs its `onClick`, and nothing else. It
     * never navigates or opens a tab and is never the highlighted entry; its
     * `route` is ignored. An empty array makes no group.
     */
    children?: IRoutedMenuItemDefinition[];
}
/**
 * An entry of useRoutedMenuLogic's `definition`: the routed menu item
 * definition, converted for MenuBase, with what a menu that the app renders
 * itself needs to render the entry as a link and to mark the current page.
 * Every field of the definition is kept, `route` too (still the pattern), and
 * so are fields an app adds to IMenuItemDefinition through module
 * augmentation.
 */
export interface IRoutedMenuEntry extends Omit<IRoutedMenuItemDefinition, "onClick" | "onAuxClick" | "forceExpand" | "children"> {
    /**
     * Runs the definition's `onClick`, then navigates to the entry's target
     * (`href`) in the app. Put it on the element that renders the entry.
     *
     * On a link (an `<a>` with `href`): a plain click is kept from loading the
     * href as a new page and navigates in the app, replacing the history entry
     * when `href` is the current location (see IRoutedMenuItemDefinition's
     * `route`) and pushing one otherwise; a click with Ctrl, Meta, Shift or Alt
     * is left to the browser, which opens the link in a new tab or window. On
     * any other element (a button): a click with Ctrl, Meta or Shift opens
     * `href` in a new tab, any other click navigates in the app as a plain
     * click on a link does. An entry without target only runs the definition's
     * `onClick`.
     */
    onClick: React.MouseEventHandler;
    /**
     * For the middle button only (browsers fire `auxclick` for the right
     * button too): runs the definition's `onAuxClick`, then, on an element
     * other than a link, opens `href` in a new tab. A link is opened in a new
     * tab by the browser.
     */
    onAuxClick: React.MouseEventHandler;
    /**
     * Keep the group expanded: `true` for the groups above the entry of the
     * current URL (`containsCurrent`) while the menu shows that entry, and for
     * an entry whose definition sets `forceExpand`. MenuBase keeps such a group
     * expanded; a menu rendered by the app does the same, or ignores it for
     * groups that open as a popup.
     */
    forceExpand: boolean;
    /**
     * The URL of the entry's target, as the router's history writes it
     * (`history.createHref`): the route with its params filled in from the
     * current URL, without a trailing `/*`, below the enclosing Route for a
     * relative route, with the route's search and hash, e.g.
     * `/projects/42/review`, or `#/users` with a hash history. The URL a click
     * navigates to and a new tab opens. `undefined` for an entry without
     * `route` (an action), for a group (its `route` is ignored) and for an
     * entry hidden because the current URL has no value for one of its params.
     *
     * Render an entry with an `href` as a link (`<a href>`, or MUI's
     * `ListItemButton`, which renders a link when it gets an `href`) with the
     * entry's `onClick` and `onAuxClick` on it; render an entry without one as
     * a button.
     */
    href: string | undefined;
    /**
     * Is this the entry of the current URL, the shown entry whose route
     * matches it best (see IRoutedMenuItemDefinition's `route`)? Put
     * `aria-current="page"` on its element, so screen readers announce it as
     * the current page. A hidden entry is `true` only on a page that no shown
     * entry matches; it is not rendered then. Always `false` for a group, and
     * for every entry on a URL that no entry matches.
     */
    current: boolean;
    /**
     * Does this group contain the entry of the current URL, at any depth? For
     * a visual mark on the groups above the current page, also when that entry
     * is hidden (`current`). `false` for the current entry itself and for
     * entries without children.
     */
    containsCurrent: boolean;
    /**
     * The entry's menu item id: its title and the titles of the groups above
     * it, from the top level, joined by `@` ("Settings@Profile"), as MenuBase
     * builds it and as `controlledState` holds the id of the current entry.
     * Sibling entries with the same title share one. A stable React `key`.
     */
    menuItemId: string;
    /**
     * The converted children of this entry
     */
    children?: IRoutedMenuEntry[];
}
export interface IRoutedMenuProps extends Omit<MenuProps, "definition" | "customState"> {
    /**
     * The menu definition (with routing support)
     */
    definition: IRoutedMenuItemDefinition[];
}
/**
 * What useRoutedMenuLogic returns
 */
export interface UseRoutedMenuLogicResult {
    /**
     * The entries converted for MenuBase's `definition` or for a menu rendered
     * by the app, in definition order: each with handlers that navigate to its
     * route, the URL of that route (`href`), whether it is the entry of the
     * current URL (`current`) or a group above it (`containsCurrent`, which
     * also sets `forceExpand`), and its menu item id. See IRoutedMenuEntry.
     */
    definition: IRoutedMenuEntry[];
    /**
     * For MenuBase's `customState` or a `MenuContext.Provider`: the menu item
     * id of the entry of the current URL (see IRoutedMenuEntry's `current`;
     * `""` when no entry matches the URL) and a setter that does nothing,
     * because the active entry follows the URL only
     */
    controlledState: [string, Dispatch<SetStateAction<string>>];
}
/**
 * The routing logic of RoutedMenu, for a menu the app renders itself. Must be
 * called inside a HistoryRouter; called inside a Route, the routes without a
 * leading slash are relative to that Route (see IRoutedMenuItemDefinition's
 * `route`).
 *
 * Render each entry of `definition` with `shouldRender` (an entry the
 * current URL cannot fill the params of has it `false`):
 * - with an `href` as a link: `href`, `onClick` and `onAuxClick` on an `<a>`
 *   (or on MUI's `ListItemButton`, which then renders one), and
 *   `aria-current="page"` while it is `current`. A plain click navigates in
 *   the app, and the browser offers what it offers for any link: open it in a
 *   new tab with a modified or middle click, copy its address.
 * - without `href` (an action) as a button with its `onClick`.
 * - a group as a button that shows and hides its children, with
 *   `aria-expanded` from the menu's own state, kept expanded while
 *   `forceExpand` is set.
 *
 * Entries rendered as buttons that call `onClick` work too: a Ctrl, Meta or
 * Shift click and a middle click open `href` in a new tab.
 * @param props The menu definition; keep it referentially stable, the
 * entries are converted again whenever it changes
 * @return The converted entries and the menu state, see
 * UseRoutedMenuLogicResult
 */
export declare const useRoutedMenuLogic: (props: Pick<IRoutedMenuProps, "definition">) => UseRoutedMenuLogicResult;
declare const _default: React.MemoExoticComponent<(props: IRoutedMenuProps) => React.JSX.Element>;
export default _default;
