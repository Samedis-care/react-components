import { jsx as _jsx } from "react/jsx-runtime";
import React, { useContext, useEffect, useRef, } from "react";
import { parsePath } from "history";
import { getMissingRouteParameters, insertRouteParameters, } from "../../../utils/routeUtils";
import matchPath from "../../../standalone/Routes/matchPath";
import joinRoutePath from "../../../standalone/Routes/joinRoutePath";
import { compareRouteSpecificity, getRouteSpecificity, } from "../../../standalone/Routes/routeSpecificity";
import { RouteContext, useRoutePrefix } from "../../../standalone/Routes/Route";
import { useHistoryRouterContext } from "../../../standalone/Routes/HistoryRouter";
import toAppPath from "../../../standalone/Routes/toAppPath";
import { isCurrentLocation } from "../../../standalone/Routes/navigationTarget";
import MenuBase from "../../../standalone/Portal/Menu";
import useLocation from "../../../standalone/Routes/useLocation";
import useNavigate from "../../../standalone/Routes/useNavigate";
/**
 * Reads an entry's route: the pattern it matches the current path with and
 * the parts of its navigation target, see IRoutedMenuItemDefinition's `route`
 * @param route The entry's route, e.g. `/devices/*`, `/tasks?tab=open` or
 * `users`
 * @param base What a relative route is resolved against
 */
const resolveRoute = (route, base) => {
    const { pathname = "", search = "", hash = "" } = parsePath(route);
    const relative = !pathname.startsWith("/");
    // a trailing "*" segment matches any rest, it is no part of a target
    const path = pathname.replace(/(^|\/)\*$/, "");
    return {
        pattern: relative ? joinRoutePath(base.path, pathname) : pathname,
        path: relative || path ? path : "/",
        base: relative ? base.url : null,
        suffix: search + hash,
    };
};
/**
 * The menu item id of an entry, as MenuBase builds it
 * @param parent The menu item id of the group above the entry, null on the
 * top level
 * @param title The entry's title
 */
const getItemId = (parent, title) => parent ? `${parent}@${title}` : title;
/**
 * The route of an entry's page: its `route`, or none for a group (an entry
 * with children, which MenuBase renders expandable), which only shows and
 * hides its entries
 * @param definition The routed menu item definition
 * @return The route; undefined for a group and for an entry without route
 */
const getPageRoute = (definition) => definition.children && definition.children.length > 0
    ? undefined
    : definition.route;
/**
 * The entries of the menu tree that have a page route (getPageRoute), depth
 * first in definition order, with their menu item ids
 * @param definitions The menu item definitions
 * @param groups The menu item ids of the groups above `definitions`
 * @param rendered Are the groups above `definitions` rendered?
 * @param base What a relative route is resolved against
 * @return The entries, see RoutedEntry
 */
const flattenRoutes = (definitions, groups, rendered, base) => definitions.flatMap((def) => {
    const id = getItemId(groups[groups.length - 1] ?? null, def.title);
    const route = getPageRoute(def);
    const entryRendered = rendered && def.shouldRender;
    return [
        ...(route
            ? [
                {
                    id,
                    groups,
                    rendered: entryRendered,
                    route: resolveRoute(route, base),
                    end: !!def.end,
                },
            ]
            : []),
        ...(def.children
            ? flattenRoutes(def.children, [...groups, id], entryRendered, base)
            : []),
    ];
});
/**
 * Percent-encodes route params for a path, so a value with "/", "?", "#" or
 * "%" stays one segment
 * @param params The params as matchPath gives them (decoded)
 */
const encodeRouteParameters = (params) => Object.fromEntries(Object.entries(params).map(([name, value]) => [
    name,
    encodeURIComponent(value),
]));
/**
 * The candidate whose route matches the path best: the most specific one
 * (compareRouteSpecificity), of equally specific ones the deepest in the menu
 * tree; on a full tie the earlier one in definition order
 * @param candidates The entries whose route matches the path, in definition
 * order
 * @return The best one, or null for no candidates
 */
const getBestCandidate = (candidates) => candidates.reduce((best, candidate) => best &&
    (compareRouteSpecificity(candidate.specificity, best.specificity) ||
        best.entry.groups.length - candidate.entry.groups.length) >= 0
    ? best
    : candidate, null);
/**
 * The entry of the current URL and the params of the URL. Of all entries
 * whose route matches the path as a prefix (getBestCandidate ranks them):
 * - the best one, hidden entries and entries with `end` included, provides
 *   the params that fill the routes of all entries;
 * - the best one the menu shows is the entry of the current URL: highlighted,
 *   and the groups above it are expanded. An entry is shown when it and every
 *   group above it have `shouldRender` and the params can fill its route.
 * When no shown entry matches, the best hidden one is the entry of the current
 * URL: the active id, and the groups above it contain it, but it is not
 * rendered and expands no group (`shown: false`). An entry with `end` is the
 * entry of the current URL only where its route matches the whole path.
 * @param definitions The menu item definitions (the top level)
 * @param path The current location.pathname
 * @param base What a relative route is resolved against
 * @return The entry of the current URL (null if no entry matches) and the
 * params
 */
const resolveLocation = (definitions, path, base) => {
    const candidates = flattenRoutes(definitions, [], true, base).flatMap((entry) => {
        const match = matchPath({ path: entry.route.pattern, end: false }, path);
        return match
            ? [
                {
                    entry,
                    params: match.params,
                    specificity: getRouteSpecificity(entry.route.pattern),
                },
            ]
            : [];
    });
    const best = getBestCandidate(candidates);
    const params = best ? encodeRouteParameters(best.params) : {};
    // an entry with `end` is the entry of its own path only
    const eligible = candidates.filter(({ entry }) => !entry.end || !!matchPath({ path: entry.route.pattern, end: true }, path));
    const bestShown = getBestCandidate(eligible.filter(({ entry }) => entry.rendered &&
        getMissingRouteParameters(entry.route.path, params).length === 0));
    const current = bestShown ?? getBestCandidate(eligible);
    return {
        current: current
            ? {
                id: current.entry.id,
                groups: current.entry.groups,
                shown: !!bestShown,
            }
            : null,
        params,
    };
};
/**
 * The navigation target of an entry
 * @param definition The routed menu item definition
 * @param params The params of the current URL (resolveLocation)
 * @param base What a relative route is resolved against
 * @return The route's path with the params filled in, without a trailing
 * `/*`, below the enclosing Route's url for a relative route, and with the
 * route's search and hash; undefined for an entry without route and for a
 * group, null when `params` lacks one of the route's params
 */
const getTarget = (definition, params, base) => {
    const pageRoute = getPageRoute(definition);
    if (!pageRoute)
        return undefined;
    const route = resolveRoute(pageRoute, base);
    const path = insertRouteParameters(route.path, params);
    if (path === null)
        return null;
    if (route.base === null)
        return path + route.suffix;
    return (path ? joinRoutePath(route.base, path) : route.base) + route.suffix;
};
/**
 * The URL that a new tab opens for an entry: the URL a plain click on it
 * navigates to. The target goes to the history as useNavigate hands it over,
 * its leading slashes collapsed into one, and the history writes it as a URL,
 * e.g. "#/users" for a hash history (a new tab at "/users" would be outside
 * of the app).
 * @param history The router's history
 * @param target The entry's navigation target (getTarget)
 * @return The href, or null for a target that is no path of the app, which
 * useNavigate refuses too
 */
const getTargetHref = (history, target) => {
    const path = toAppPath(target);
    return path === null ? null : history.createHref(path);
};
/**
 * Navigates to an entry's target in the app, as a plain click on a link to it
 * does: it replaces the history entry when the target is the current location
 * (the same pathname, search and hash), so a click on the entry of the current
 * page adds no second entry for it, and pushes otherwise
 * @param navigate The navigate function of the HistoryRouter
 * @param history The router's history, whose location is the current one
 * @param target The entry's navigation target (getTarget)
 */
const navigateToTarget = (navigate, history, target) => {
    const path = toAppPath(target);
    navigate(target, {
        replace: path !== null && isCurrentLocation(history.location, path),
    });
};
/**
 * The entries hidden because the current URL cannot fill their route: only
 * entries the definition renders (`shouldRender`), and not the entries below
 * such an entry
 * @param definitions The menu item definitions
 * @param params The params of the current URL (resolveLocation)
 * @param base What a relative route is resolved against
 * @param parent The title path of the parent entry, null on the top level
 * @return Each entry's title path (`Group > Entry`), route and missing params
 */
const getUnresolvedEntries = (definitions, params, base, parent) => definitions.flatMap((def) => {
    if (!def.shouldRender)
        return [];
    const titlePath = parent ? `${parent} > ${def.title}` : def.title;
    const route = getPageRoute(def);
    const missing = route
        ? getMissingRouteParameters(resolveRoute(route, base).path, params)
        : [];
    if (route && missing.length > 0)
        return [{ titlePath, route, missing }];
    return def.children
        ? getUnresolvedEntries(def.children, params, base, titlePath)
        : [];
});
/**
 * Is the element a link that the browser follows by itself, an `<a>` with an
 * `href`? A menu rendered by the app may put an entry's handlers on one: the
 * browser then opens the new tab for a modified or middle click, and a plain
 * click must not load the href as a new page.
 * @param element The element the handler runs on (the event's
 * currentTarget; missing on an event an app makes up)
 */
const isLink = (element) => element instanceof HTMLAnchorElement && element.hasAttribute("href");
/**
 * Converts a routed menu item definition to an entry for MenuBase or a menu
 * rendered by the app
 * @param context The current URL's entry and params, and the router
 * @param definition The routed menu item definition
 * @param id The menu item id of the definition
 * @return The entry, see IRoutedMenuEntry
 */
const convertDefinition = (context, definition, id) => {
    const { current, params, base, navigate, history } = context;
    // keep URL parameters
    const target = getTarget(definition, params, base);
    const href = target
        ? (getTargetHref(history, target) ?? undefined)
        : undefined;
    const containsCurrent = !!definition.children && !!current?.groups.includes(id);
    return {
        ...definition,
        // an entry whose route the current URL cannot fill has nowhere to go
        shouldRender: definition.shouldRender && target !== null,
        // the entry's own flag, and the groups above the entry of the current URL
        // while the menu shows it: a hidden entry has nothing to keep in view
        forceExpand: !!definition.forceExpand || (containsCurrent && !!current?.shown),
        href,
        current: current?.id === id,
        containsCurrent,
        menuItemId: id,
        children: definition.children?.map((entry) => convertDefinition(context, entry, getItemId(id, entry.title))),
        onClick: (evt) => {
            if (definition.onClick) {
                definition.onClick(evt);
            }
            if (!target)
                return;
            if (isLink(evt.currentTarget)) {
                // the browser opens a new tab or window for a modified click
                if (evt.ctrlKey || evt.metaKey || evt.shiftKey || evt.altKey)
                    return;
                evt.preventDefault();
                navigateToTarget(navigate, history, target);
            }
            else if (evt.ctrlKey || evt.metaKey || evt.shiftKey) {
                if (href)
                    window.open(href, "_blank");
            }
            else
                navigateToTarget(navigate, history, target);
        },
        onAuxClick: (evt) => {
            // the middle button only: browsers fire auxclick for the right button
            // too. MenuBase filters as well, but useRoutedMenuLogic's handlers also
            // go to an app's own elements
            if (evt.button !== 1)
                return;
            if (definition.onAuxClick) {
                definition.onAuxClick(evt);
            }
            // the browser opens a link in a new tab itself
            if (href && !isLink(evt.currentTarget))
                window.open(href);
        },
    };
};
/**
 * The setter of useRoutedMenuLogic's active id. MenuBase calls it with the id
 * of a clicked entry; it does nothing, because the active entry is the entry
 * of the current URL.
 */
const ignoreActiveChange = () => undefined;
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
export const useRoutedMenuLogic = (props) => {
    const location = useLocation();
    const path = location.pathname;
    const navigate = useNavigate();
    const { history } = useHistoryRouterContext();
    const rawDef = props.definition;
    // the enclosing Route, which the relative routes are resolved against
    const routePrefix = useRoutePrefix();
    const routeUrl = useContext(RouteContext)?.url ?? "/";
    const base = React.useMemo(() => ({ path: routePrefix, url: routeUrl }), [routePrefix, routeUrl]);
    // the entry of the current URL (the active item and the groups to expand)
    // and the params
    const { current, params } = React.useMemo(() => resolveLocation(rawDef, path, base), [rawDef, path, base]);
    // the active item is derived from the URL, so it is never left over from an
    // earlier path or set by a click on an entry that the URL does not match
    const activeMenuItem = current?.id ?? "";
    const controlledState = React.useMemo(() => [
        activeMenuItem,
        ignoreActiveChange,
    ], [activeMenuItem]);
    // convert routed menu definitions to normal menu definitions
    const definition = React.useMemo(() => {
        const context = {
            current,
            params,
            base,
            navigate,
            history,
        };
        return rawDef.map((entry) => convertDefinition(context, entry, getItemId(null, entry.title)));
    }, [rawDef, params, current, base, navigate, history]);
    // development: name the entries hidden for a param the URL lacks, once per
    // menu instance, entry and param
    const reportedParams = useRef(null);
    useEffect(() => {
        if (process.env.NODE_ENV === "production")
            return;
        if (!reportedParams.current)
            reportedParams.current = new Set();
        const reported = reportedParams.current;
        for (const { titlePath, route, missing } of getUnresolvedEntries(rawDef, params, base, null)) {
            for (const name of missing) {
                const key = [titlePath, route, name].join("\n");
                if (reported.has(key))
                    continue;
                reported.add(key);
                // eslint-disable-next-line no-console
                console.error(`RoutedMenu: the entry "${titlePath}" (route "${route}") is hidden, because the current URL "${path}" has no value for its param ":${name}" (params are read with the menu's route that matches the URL best). Set its shouldRender to false on pages without that param.`);
            }
        }
    }, [rawDef, params, base, path]);
    return { definition, controlledState };
};
/**
 * A MenuBase driven by the URL: the shown entry whose `route` matches the
 * current path best is highlighted and the groups above it are expanded (see
 * IRoutedMenuItemDefinition's `route`; groups with `forceExpand` are
 * expanded on every page), and a click on an entry runs its `onClick` and
 * navigates to its route, replacing the history entry when the route is the
 * current location, as a link does. A click on a group only expands or
 * collapses it (and runs its `onClick`): a group has no page of its own, its
 * `route` is ignored. A Ctrl, Meta or Shift click and a middle click open
 * the URL of that navigation in a new tab instead, as the history writes it
 * (`#/users` with a hash history). The highlight follows
 * the URL only: on a path that matches no entry nothing is highlighted, and
 * a click highlights nothing by itself, only the navigation it starts does.
 * Must be rendered inside a HistoryRouter; rendered inside a Route, its
 * routes without a leading slash are relative to that Route.
 */
const RoutedMenu = (props) => {
    const { definition, controlledState } = useRoutedMenuLogic(props);
    return (_jsx(MenuBase, { ...props, definition: definition, customState: controlledState }));
};
export default React.memo(RoutedMenu);
