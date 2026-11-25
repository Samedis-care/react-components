import { jsx as _jsx } from "react/jsx-runtime";
import React, { useContext, useEffect, useRef, } from "react";
import { parsePath } from "history";
import { getMissingRouteParameters, insertRouteParameters, } from "../../../utils/routeUtils";
import matchPath, { normalizePath } from "../../../standalone/Routes/matchPath";
import joinRoutePath from "../../../standalone/Routes/joinRoutePath";
import { RouteContext, useRoutePrefix } from "../../../standalone/Routes/Route";
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
 * The segments of a route or path, as matchPath splits them
 * @param path The route or path
 */
const splitSegments = (path) => normalizePath(path)
    .split("/")
    .filter((segment) => !!segment);
/**
 * How specific a route's match of a path is
 * @param route The route, which matches the path
 * @param pathLength The number of segments of the path
 * @param depth The depth of the entry in the menu tree
 */
const getSpecificity = (route, pathLength, depth) => {
    const segments = splitSegments(route);
    const splat = segments[segments.length - 1] === "*";
    if (splat)
        segments.pop();
    return {
        exact: segments.length === pathLength,
        segments: segments.map((segment) => segment === "*" ? 0 : segment.startsWith(":") ? 1 : 2),
        splat,
        depth,
    };
};
/**
 * Orders two matches of the same path, most specific first: an exact match
 * before a prefix match, more segments first, then segment by segment from
 * the left a literal before a param before a `*`, a route without a trailing
 * `*` before one with, and a deeper entry before a shallower one
 * @return Negative when `a` is more specific, positive when `b` is, 0 on a tie
 */
const compareSpecificity = (a, b) => {
    if (a.exact !== b.exact)
        return a.exact ? -1 : 1;
    if (a.segments.length !== b.segments.length)
        return b.segments.length - a.segments.length;
    for (let i = 0; i < a.segments.length; ++i) {
        if (a.segments[i] !== b.segments[i])
            return b.segments[i] - a.segments[i];
    }
    if (a.splat !== b.splat)
        return a.splat ? 1 : -1;
    return b.depth - a.depth;
};
/**
 * The entries of the menu tree that have a route, depth first in definition
 * order, with their menu item ids
 * @param definitions The menu item definitions
 * @param groups The menu item ids of the groups above `definitions`
 * @param base What a relative route is resolved against
 * @return Each entry's id, the ids of the groups above it and the path
 * pattern of its route (resolveRoute)
 */
const flattenRoutes = (definitions, groups, base) => definitions.flatMap((def) => {
    const id = getItemId(groups[groups.length - 1] ?? null, def.title);
    return [
        ...(def.route
            ? [{ id, groups, pattern: resolveRoute(def.route, base).pattern }]
            : []),
        ...(def.children
            ? flattenRoutes(def.children, [...groups, id], base)
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
 * The entry of the whole menu tree whose route matches the path best: of all
 * entries whose route matches the path as a prefix, the most specific one
 * (compareSpecificity); on a full tie the earlier one in definition order.
 * Its id is the active menu item, its groups are expanded, and its params fill
 * the routes of all entries. Entries with `shouldRender: false` take part.
 * @param definitions The menu item definitions (the top level)
 * @param path The current location.pathname
 * @param base What a relative route is resolved against
 * @return The best match, or null if no entry matches
 */
const resolveLocation = (definitions, path, base) => {
    const pathLength = splitSegments(path).length;
    let best = null;
    for (const entry of flattenRoutes(definitions, [], base)) {
        const match = matchPath({ path: entry.pattern, end: false }, path);
        if (!match)
            continue;
        const specificity = getSpecificity(entry.pattern, pathLength, entry.groups.length);
        if (best && compareSpecificity(specificity, best.specificity) >= 0)
            continue;
        best = {
            match: {
                id: entry.id,
                groups: entry.groups,
                params: encodeRouteParameters(match.params),
            },
            specificity,
        };
    }
    return best ? best.match : null;
};
/**
 * The navigation target of an entry
 * @param definition The routed menu item definition
 * @param params The params of the current URL (resolveLocation)
 * @param base What a relative route is resolved against
 * @return The route's path with the params filled in, without a trailing
 * `/*`, below the enclosing Route's url for a relative route, and with the
 * route's search and hash; undefined for an entry without route, null when
 * `params` lacks one of the route's params
 */
const getTarget = (definition, params, base) => {
    if (!definition.route)
        return undefined;
    const route = resolveRoute(definition.route, base);
    const path = insertRouteParameters(route.path, params);
    if (path === null)
        return null;
    if (route.base === null)
        return path + route.suffix;
    return (path ? joinRoutePath(route.base, path) : route.base) + route.suffix;
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
    const missing = def.route
        ? getMissingRouteParameters(resolveRoute(def.route, base).path, params)
        : [];
    if (def.route && missing.length > 0)
        return [{ titlePath, route: def.route, missing }];
    return def.children
        ? getUnresolvedEntries(def.children, params, base, titlePath)
        : [];
});
/**
 * Converts the routed menu item definitions to normal menu item definitions
 * @param params The params of the current URL (resolveLocation)
 * @param expanded The menu item ids of the groups the current URL expands:
 * the groups above the entry of the current URL (resolveLocation). A group
 * with its own `forceExpand` is expanded too
 * @param base What a relative route is resolved against
 * @param definition The routed menu item definition
 * @param id The menu item id of the definition
 * @param navigate The react-router navigate function
 * @return a normal menu item definition
 */
const convertDefinition = (params, expanded, base, definition, id, navigate) => ({
    ...definition,
    // an entry whose route the current URL cannot fill has nowhere to go
    shouldRender: definition.shouldRender && getTarget(definition, params, base) !== null,
    // the entry's own flag, and the groups above the entry of the current URL
    forceExpand: definition.forceExpand || (definition.children && expanded.includes(id)),
    children: definition.children?.map((entry) => convertDefinition(params, expanded, base, entry, getItemId(id, entry.title), navigate)),
    onClick: (evt) => {
        if (definition.onClick) {
            definition.onClick(evt);
        }
        // keep URL parameters
        const target = getTarget(definition, params, base);
        if (target) {
            if (evt.ctrlKey || evt.metaKey || evt.shiftKey)
                window.open(target, "_blank");
            else
                navigate(target);
        }
    },
    onAuxClick: (evt) => {
        // the middle button only: browsers fire auxclick for the right button too.
        // MenuBase filters as well, but useRoutedMenuLogic's handlers also go to
        // an app's own elements
        if (evt.button !== 1)
            return;
        if (definition.onAuxClick) {
            definition.onAuxClick(evt);
        }
        // keep URL parameters
        const target = getTarget(definition, params, base);
        if (target)
            window.open(target);
    },
});
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
export const useRoutedMenuLogic = (props) => {
    const location = useLocation();
    const path = location.pathname;
    const navigate = useNavigate();
    const rawDef = props.definition;
    // the enclosing Route, which the relative routes are resolved against
    const routePrefix = useRoutePrefix();
    const routeUrl = useContext(RouteContext)?.url ?? "/";
    const base = React.useMemo(() => ({ path: routePrefix, url: routeUrl }), [routePrefix, routeUrl]);
    // the entry of the current URL: the active item, the groups to expand and
    // the params
    const current = React.useMemo(() => resolveLocation(rawDef, path, base), [rawDef, path, base]);
    // the active item is derived from the URL, so it is never left over from an
    // earlier path or set by a click on an entry that the URL does not match
    const activeMenuItem = current?.id ?? "";
    const controlledState = React.useMemo(() => [
        activeMenuItem,
        ignoreActiveChange,
    ], [activeMenuItem]);
    // convert routed menu definitions to normal menu definitions
    const params = React.useMemo(() => current?.params ?? {}, [current]);
    const definition = React.useMemo(() => rawDef.map((entry) => convertDefinition(params, current?.groups ?? [], base, entry, getItemId(null, entry.title), navigate)), [rawDef, params, current, base, navigate]);
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
 * A MenuBase driven by the URL: the entry whose `route` matches the current
 * path best is highlighted and the groups above it are expanded (see
 * IRoutedMenuItemDefinition's `route`; groups with `forceExpand` are
 * expanded on every page), and a click on an entry runs its
 * `onClick` and navigates to its route. The highlight follows the URL only:
 * on a path that matches no entry nothing is highlighted, and a click
 * highlights nothing by itself, only the navigation it starts does. Must be
 * rendered inside a HistoryRouter; rendered inside a Route, its routes
 * without a leading slash are relative to that Route.
 */
const RoutedMenu = (props) => {
    const { definition, controlledState } = useRoutedMenuLogic(props);
    return (_jsx(MenuBase, { ...props, definition: definition, customState: controlledState }));
};
export default React.memo(RoutedMenu);
