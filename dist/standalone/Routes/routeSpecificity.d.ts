/**
 * How specific a route path is, see {@link compareRouteSpecificity}.
 * Internal to the routing and RoutedMenu, not exported from the package root.
 */
export interface RouteSpecificity {
    /**
     * Per segment of the path (without a trailing `*`): 2 for a literal, 1 for
     * a `:name` param, 0 for a `*`
     */
    segments: number[];
    /**
     * The path ends in `*`
     */
    splat: boolean;
}
/**
 * How specific a route path is
 * @param path The full path pattern, e.g. "/devices/:id/*"
 * @returns Its segments and whether it ends in `*`
 */
export declare const getRouteSpecificity: (path: string) => RouteSpecificity;
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
export declare const compareRouteSpecificity: (a: RouteSpecificity, b: RouteSpecificity) => number;
