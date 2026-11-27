import { normalizePath } from "./matchPath";
/**
 * How specific a route path is
 * @param path The full path pattern, e.g. "/devices/:id/*"
 * @returns Its segments and whether it ends in `*`
 */
export const getRouteSpecificity = (path) => {
    const segments = normalizePath(path)
        .split("/")
        .filter((segment) => !!segment);
    const splat = segments[segments.length - 1] === "*";
    if (splat)
        segments.pop();
    return {
        segments: segments.map((segment) => segment === "*" ? 0 : segment.startsWith(":") ? 1 : 2),
        splat,
    };
};
/**
 * Orders two routes that match the same location, the most specific first:
 * the route with more segments (a route never has more segments than a
 * location it matches, so one that covers every segment of the location comes
 * before a prefix match), then, segment by segment from the left, a literal
 * before a `:name` param before a `*`, then a route without a trailing `*`
 * before one with. `Routes` renders its child by this order and `RoutedMenu`
 * highlights its entry by it.
 * @param a The specificity of one route
 * @param b The specificity of the other route
 * @returns Negative when `a` is more specific, positive when `b` is, 0 on a
 * tie
 */
export const compareRouteSpecificity = (a, b) => {
    if (a.segments.length !== b.segments.length)
        return b.segments.length - a.segments.length;
    for (let i = 0; i < a.segments.length; ++i) {
        if (a.segments[i] !== b.segments[i])
            return b.segments[i] - a.segments[i];
    }
    if (a.splat !== b.splat)
        return a.splat ? 1 : -1;
    return 0;
};
