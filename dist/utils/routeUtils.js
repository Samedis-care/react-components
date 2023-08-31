import { matchPath, UNSAFE_RouteContext } from "react-router-dom";
import React from "react";
export const doesRouteMatch = (route, path, exact = false, strict = false) => !!matchPath({ path: route, caseSensitive: strict, end: exact }, path);
export const extractRouteParameters = (route, path, exact = false, strict = false) => {
    const match = matchPath({ path: route, caseSensitive: strict, end: exact }, path);
    if (!match)
        throw new Error("Route does not match");
    return match.params;
};
export const insertRouteParameters = (route, params) => {
    let pathParts = route.split("/");
    pathParts = pathParts.map((entry) => entry.startsWith(":") ? params[entry.substr(1)] : entry);
    return pathParts.join("/");
};
const reconstructPath = (matches) => {
    const path = matches[matches.length - 1].route.path;
    return path
        ? path.endsWith("/*")
            ? path.slice(0, -1)
            : path
                ? path + "/"
                : ""
        : "";
};
const findLastNode = (node) => node.outlet
    ? findLastNode(node.outlet.props.value)
    : node;
export const useRouteInfo = (optional = false) => {
    const routeInfo = findLastNode(React.useContext(UNSAFE_RouteContext));
    if (optional && routeInfo.matches.length === 0)
        return { route: "", url: "" };
    return {
        route: reconstructPath(routeInfo.matches),
        url: routeInfo.matches[routeInfo.matches.length - 1].pathnameBase,
    };
};
