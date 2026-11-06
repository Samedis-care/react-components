import matchPath from "../standalone/Routes/matchPath";
export const doesRouteMatch = (route, path, exact = false, strict = false) => !!matchPath({ path: route, caseSensitive: strict, end: exact }, path);
export const extractRouteParameters = (route, path, exact = false, strict = false) => {
    const match = matchPath({ path: route, caseSensitive: strict, end: exact }, path);
    if (!match)
        throw new Error("Route does not match");
    return match.params;
};
/**
 * The params of a route that have no value
 * @param route The route, e.g. `/apps/:app/roles`
 * @param params The param values by name
 * @returns The names (without `:`) of the route's params that `params` has no
 * value, or an empty one, for, in route order; empty when the route can be
 * filled
 */
export const getMissingRouteParameters = (route, params) => route
    .split("/")
    .filter((segment) => segment.startsWith(":"))
    .map((segment) => segment.substring(1))
    .filter((name) => !Object.prototype.hasOwnProperty.call(params, name) || !params[name]);
/**
 * Fills the `:name` segments of a route with the given params
 * @param route The route, e.g. `/apps/:app/roles`
 * @param params The param values by name, inserted as given (not encoded)
 * @returns The path, or null when `params` has no value (or an empty one) for
 * one of the route's params (see getMissingRouteParameters)
 */
export const insertRouteParameters = (route, params) => getMissingRouteParameters(route, params).length > 0
    ? null
    : route
        .split("/")
        .map((segment) => segment.startsWith(":") ? params[segment.substring(1)] : segment)
        .join("/");
