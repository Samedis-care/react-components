import matchPath from "../standalone/Routes/matchPath";
export const doesRouteMatch = (route, path, exact = false, strict = false) => !!matchPath({ path: route, caseSensitive: strict, end: exact }, path);
export const extractRouteParameters = (route, path, exact = false, strict = false) => {
    const match = matchPath({ path: route, caseSensitive: strict, end: exact }, path);
    if (!match)
        throw new Error("Route does not match");
    return match.params;
};
export const insertRouteParameters = (route, params) => {
    let pathParts = route.split("/");
    pathParts = pathParts.map((entry) => entry.startsWith(":") ? params[entry.substring(1)] : entry);
    return pathParts.join("/");
};
