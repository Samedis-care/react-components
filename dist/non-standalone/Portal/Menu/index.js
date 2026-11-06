import { jsx as _jsx } from "react/jsx-runtime";
import React, { useEffect, useRef, useState } from "react";
import { doesRouteMatch, extractRouteParameters, getMissingRouteParameters, insertRouteParameters, } from "../../../utils/routeUtils";
import MenuBase from "../../../standalone/Portal/Menu";
import useLocation from "../../../standalone/Routes/useLocation";
import useNavigate from "../../../standalone/Routes/useNavigate";
/**
 * All entries of the menu tree, depth first in definition order
 * @param definitions The menu item definitions
 */
const flattenDefinitions = (definitions) => definitions.flatMap((def) => [
    def,
    ...(def.children ? flattenDefinitions(def.children) : []),
]);
/**
 * Extract current route params
 * Reads them with the route of the whole tree that matches best: an exact
 * match first, otherwise the longest route that matches as a prefix. Returns
 * `{}` when nothing matches.
 * @param definitions The route definitions (the top level)
 * @param path The current location.pathname
 */
const getMenuRouteParams = (definitions, path) => {
    const candidates = flattenDefinitions(definitions);
    // first try and find an exact match
    let exact = true;
    let match = candidates.find((entry) => entry.route && doesRouteMatch(entry.route, path, true));
    if (!match) {
        // if this fails, get the closest match we can get
        exact = false;
        // candidates is a copy: sorting the caller's definition in place would
        // reorder the rendered menu
        match = candidates
            .sort((a, b) => (b.route?.length ?? 0) - (a.route?.length ?? 0))
            .find((entry) => entry.route && doesRouteMatch(entry.route, path));
    }
    if (!match)
        return {};
    const route = match.route;
    return extractRouteParameters(route, path, exact);
};
/**
 * The navigation target of an entry
 * @param definition The routed menu item definition
 * @param params The params of the current URL (getMenuRouteParams)
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
 * @param params The params of the current URL (getMenuRouteParams)
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
 * @param params The params of the current URL (getMenuRouteParams)
 * @param definition The routed menu item definition
 * @param path The current location.pathname
 * @param depth The depth of the menu item
 * @param navigate The react-router navigate function
 * @return a normal menu item definition
 */
const convertDefinition = (params, definition, path, depth, navigate) => ({
    ...definition,
    // an entry whose route the current URL cannot fill has nowhere to go
    shouldRender: definition.shouldRender && getTarget(definition, params) !== null,
    forceExpand: definition.children &&
        !!resolveLocation(definition.children, path, depth + 1, null),
    children: definition.children?.map((entry) => convertDefinition(params, entry, path, depth + 1, navigate)),
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
/**
 * Returns the internal name used by the menu to set the active state based off the given path
 * @param definitions The menu item definitions
 * @param path The current location.pathname
 * @param depth The depth of the menu item
 * @param itemId The menu item id
 * @return The menu item "identifier" used to set the menu item active or undefined if no match has been found
 */
const resolveLocation = (definitions, path, depth, itemId) => {
    // first recurse to find the deepest matching link
    for (const def of definitions) {
        if (def.children) {
            const nextLevel = resolveLocation(def.children, path, depth + 1, itemId ? `${itemId}@${def.title}` : def.title);
            if (nextLevel)
                return nextLevel;
        }
    }
    // then try this level
    const matchDef = [...definitions]
        .sort((a, b) => (b.route?.length ?? 0) - (a.route?.length ?? 0))
        .find((def) => def.route && doesRouteMatch(def.route, path, false));
    return matchDef
        ? itemId
            ? `${itemId}@${matchDef.title}`
            : matchDef.title
        : null;
};
export const useRoutedMenuLogic = (props) => {
    const controlledState = useState("");
    const [activeMenuItem, setActiveMenuItem] = controlledState;
    const location = useLocation();
    const path = location.pathname;
    const navigate = useNavigate();
    // set the currently active item based off location
    useEffect(() => {
        const menuEntry = resolveLocation(props.definition, path, 0, null);
        if (menuEntry && activeMenuItem !== menuEntry) {
            setActiveMenuItem(menuEntry);
        }
    }, [activeMenuItem, path, props.definition, setActiveMenuItem]);
    // convert routed menu definitions to normal menu definitions
    const rawDef = props.definition;
    const params = React.useMemo(() => getMenuRouteParams(rawDef, path), [rawDef, path]);
    const definition = React.useMemo(() => rawDef.map((entry) => convertDefinition(params, entry, path, 0, navigate)), [rawDef, params, path, navigate]);
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
