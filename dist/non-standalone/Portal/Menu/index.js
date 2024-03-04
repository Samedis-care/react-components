import React, { useEffect, useState } from "react";
import { doesRouteMatch, extractRouteParameters, insertRouteParameters, } from "../../../utils/routeUtils";
import MenuBase from "../../../standalone/Portal/Menu";
import useLocation from "../../../standalone/Routes/useLocation";
import useNavigate from "../../../standalone/Routes/useNavigate";
/**
 * Extract current route params
 * @param definitions The route definitions
 * @param path The current location.pathname
 */
const getMenuRouteParams = (definitions, path) => {
    // first try and find an exact match
    let exact = true;
    let match = definitions.find((entry) => entry.route && doesRouteMatch(entry.route, path, true));
    if (!match) {
        // if this fails, get the closest match we can get
        exact = false;
        match = definitions
            .sort((a, b) => (b.route?.length ?? 0) - (a.route?.length ?? 0))
            .find((entry) => entry.route && doesRouteMatch(entry.route, path));
    }
    if (!match)
        return {};
    const route = match.route;
    return extractRouteParameters(route, path, exact);
};
/**
 * Converts the routed menu item definitions to normal menu item definitions
 * @param definitions All menu items
 * @param definition The routed menu item definition
 * @param path The current location.pathname
 * @param depth The depth of the menu item
 * @param navigate The react-router navigate function
 * @return a normal menu item definition
 */
const convertDefinition = (definitions, definition, path, depth, navigate) => ({
    ...definition,
    forceExpand: definition.children &&
        !!resolveLocation(definition.children, path, depth + 1, null),
    children: definition.children?.map((entry) => convertDefinition(definitions, entry, path, depth + 1, navigate)),
    onClick: (evt) => {
        if (definition.onClick) {
            definition.onClick(evt);
        }
        if (definition.route) {
            // keep URL parameters
            const target = insertRouteParameters(definition.route, getMenuRouteParams(definitions, path));
            if (evt.ctrlKey || evt.metaKey || evt.shiftKey)
                window.open(target, "_blank");
            else
                navigate(target);
        }
    },
    onAuxClick: (evt) => {
        if (definition.onAuxClick) {
            definition.onAuxClick(evt);
        }
        if (definition.route) {
            // keep URL parameters
            const target = insertRouteParameters(definition.route, getMenuRouteParams(definitions, path));
            window.open(target);
        }
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
const RoutedMenu = (props) => {
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
    const definition = React.useMemo(() => {
        return rawDef.map((entry) => convertDefinition(rawDef, entry, path, 0, navigate));
    }, [rawDef, path, navigate]);
    return (React.createElement(MenuBase, { ...props, definition: definition, customState: controlledState }));
};
export default React.memo(RoutedMenu);
