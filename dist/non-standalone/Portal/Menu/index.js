import { jsx as _jsx } from "react/jsx-runtime";
import React, { useEffect, useRef, useState } from "react";
import { getMissingRouteParameters, insertRouteParameters, } from "../../../utils/routeUtils";
import matchPath, { normalizePath } from "../../../standalone/Routes/matchPath";
import MenuBase from "../../../standalone/Portal/Menu";
import useLocation from "../../../standalone/Routes/useLocation";
import useNavigate from "../../../standalone/Routes/useNavigate";
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
 */
const flattenRoutes = (definitions, groups) => definitions.flatMap((def) => {
    const id = getItemId(groups[groups.length - 1] ?? null, def.title);
    return [
        ...(def.route ? [{ id, groups, route: def.route }] : []),
        ...(def.children ? flattenRoutes(def.children, [...groups, id]) : []),
    ];
});
/**
 * The entry of the whole menu tree whose route matches the path best: of all
 * entries whose route matches the path as a prefix, the most specific one
 * (compareSpecificity); on a full tie the earlier one in definition order.
 * Its id is the active menu item, its groups are expanded, and its params fill
 * the routes of all entries. Entries with `shouldRender: false` take part.
 * @param definitions The menu item definitions (the top level)
 * @param path The current location.pathname
 * @return The best match, or null if no entry matches
 */
const resolveLocation = (definitions, path) => {
    const pathLength = splitSegments(path).length;
    let best = null;
    for (const entry of flattenRoutes(definitions, [])) {
        const match = matchPath({ path: entry.route, end: false }, path);
        if (!match)
            continue;
        const specificity = getSpecificity(entry.route, pathLength, entry.groups.length);
        if (best && compareSpecificity(specificity, best.specificity) >= 0)
            continue;
        best = {
            match: { id: entry.id, groups: entry.groups, params: match.params },
            specificity,
        };
    }
    return best ? best.match : null;
};
/**
 * The navigation target of an entry
 * @param definition The routed menu item definition
 * @param params The params of the current URL (resolveLocation)
 * @return The route with the params filled in; undefined for an entry without
 * route, null when `params` lacks one of the route's params
 */
const getTarget = (definition, params) => definition.route
    ? insertRouteParameters(definition.route, params)
    : undefined;
/**
 * The entries hidden because the current URL cannot fill their route: only
 * entries the definition renders (`shouldRender`), and not the entries below
 * such an entry
 * @param definitions The menu item definitions
 * @param params The params of the current URL (resolveLocation)
 * @param parent The title path of the parent entry, null on the top level
 * @return Each entry's title path (`Group > Entry`), route and missing params
 */
const getUnresolvedEntries = (definitions, params, parent) => definitions.flatMap((def) => {
    if (!def.shouldRender)
        return [];
    const titlePath = parent ? `${parent} > ${def.title}` : def.title;
    const missing = def.route
        ? getMissingRouteParameters(def.route, params)
        : [];
    if (def.route && missing.length > 0)
        return [{ titlePath, route: def.route, missing }];
    return def.children
        ? getUnresolvedEntries(def.children, params, titlePath)
        : [];
});
/**
 * Converts the routed menu item definitions to normal menu item definitions
 * @param params The params of the current URL (resolveLocation)
 * @param expanded The menu item ids of the groups to expand: the groups above
 * the entry of the current URL (resolveLocation)
 * @param definition The routed menu item definition
 * @param id The menu item id of the definition
 * @param navigate The react-router navigate function
 * @return a normal menu item definition
 */
const convertDefinition = (params, expanded, definition, id, navigate) => ({
    ...definition,
    // an entry whose route the current URL cannot fill has nowhere to go
    shouldRender: definition.shouldRender && getTarget(definition, params) !== null,
    forceExpand: definition.children && expanded.includes(id),
    children: definition.children?.map((entry) => convertDefinition(params, expanded, entry, getItemId(id, entry.title), navigate)),
    onClick: (evt) => {
        if (definition.onClick) {
            definition.onClick(evt);
        }
        // keep URL parameters
        const target = getTarget(definition, params);
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
        const target = getTarget(definition, params);
        if (target)
            window.open(target);
    },
});
export const useRoutedMenuLogic = (props) => {
    const controlledState = useState("");
    const [activeMenuItem, setActiveMenuItem] = controlledState;
    const location = useLocation();
    const path = location.pathname;
    const navigate = useNavigate();
    const rawDef = props.definition;
    // the entry of the current URL: the active item, the groups to expand and
    // the params
    const current = React.useMemo(() => resolveLocation(rawDef, path), [rawDef, path]);
    // set the currently active item based off location
    useEffect(() => {
        const menuEntry = current?.id;
        if (menuEntry && activeMenuItem !== menuEntry) {
            setActiveMenuItem(menuEntry);
        }
    }, [activeMenuItem, current, setActiveMenuItem]);
    // convert routed menu definitions to normal menu definitions
    const params = React.useMemo(() => current?.params ?? {}, [current]);
    const definition = React.useMemo(() => rawDef.map((entry) => convertDefinition(params, current?.groups ?? [], entry, getItemId(null, entry.title), navigate)), [rawDef, params, current, navigate]);
    // development: name the entries hidden for a param the URL lacks, once per
    // menu instance, entry and param
    const reportedParams = useRef(null);
    useEffect(() => {
        if (process.env.NODE_ENV === "production")
            return;
        if (!reportedParams.current)
            reportedParams.current = new Set();
        const reported = reportedParams.current;
        for (const { titlePath, route, missing } of getUnresolvedEntries(rawDef, params, null)) {
            for (const name of missing) {
                const key = [titlePath, route, name].join("\n");
                if (reported.has(key))
                    continue;
                reported.add(key);
                // eslint-disable-next-line no-console
                console.error(`RoutedMenu: the entry "${titlePath}" (route "${route}") is hidden, because the current URL "${path}" has no value for its param ":${name}" (params are read with the menu's route that matches the URL best). Set its shouldRender to false on pages without that param.`);
            }
        }
    }, [rawDef, params, path]);
    return { definition, controlledState };
};
const RoutedMenu = (props) => {
    const { definition, controlledState } = useRoutedMenuLogic(props);
    return (_jsx(MenuBase, { ...props, definition: definition, customState: controlledState }));
};
export default React.memo(RoutedMenu);
