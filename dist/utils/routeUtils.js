import { matchPath, UNSAFE_RouteContext } from "react-router-dom";
import React from "react";
export var doesRouteMatch = function (route, path, exact, strict) {
    if (exact === void 0) { exact = false; }
    if (strict === void 0) { strict = false; }
    return !!matchPath({ path: route, caseSensitive: strict, end: exact }, path);
};
export var extractRouteParameters = function (route, path, exact, strict) {
    if (exact === void 0) { exact = false; }
    if (strict === void 0) { strict = false; }
    var match = matchPath({ path: route, caseSensitive: strict, end: exact }, path);
    if (!match)
        throw new Error("Route does not match");
    return match.params;
};
export var insertRouteParameters = function (route, params) {
    var pathParts = route.split("/");
    pathParts = pathParts.map(function (entry) {
        return entry.startsWith(":") ? params[entry.substr(1)] : entry;
    });
    return pathParts.join("/");
};
var reconstructPath = function (matches) {
    var path = matches[matches.length - 1].route.path;
    return path
        ? path.endsWith("/*")
            ? path.slice(0, -1)
            : path
                ? path + "/"
                : ""
        : "";
};
var findLastNode = function (node) {
    return node.outlet
        ? findLastNode(node.outlet.props.value)
        : node;
};
export var useRouteInfo = function (optional) {
    if (optional === void 0) { optional = false; }
    var routeInfo = findLastNode(React.useContext(UNSAFE_RouteContext));
    if (optional && routeInfo.matches.length === 0)
        return { route: "", url: "" };
    return {
        route: reconstructPath(routeInfo.matches),
        url: routeInfo.matches[routeInfo.matches.length - 1].pathnameBase,
    };
};
