export interface PathPattern {
    /**
     * The route path
     */
    path: string;
    /**
     * Case-sensitive matching
     */
    caseSensitive?: boolean;
    /**
     * If true: verify that the location matches the route from start to end (unless route ends with wildcard *)
     * Example: location /hello/world/good does not match path /hello/world if set to true,
     *          but does match if path is /hello/world/* or location is /hello/world
     */
    end?: boolean;
}
export interface PathMatch {
    /**
     * The url portion matching the route path (route path with parameter values inserted)
     */
    url: string;
    /**
     * The route parameters
     */
    params: Record<string, string>;
}
/**
 * turn // to / in paths
 * @param path The path to normalize
 */
export declare const normalizePath: (path: string) => string;
/**
 * match a location to a route
 * @param pattern the route
 * @param pathname the location pathname
 * @return PathMatch if matched, null if not
 */
declare const matchPath: (pattern: PathPattern, pathname: string) => PathMatch | null;
export default matchPath;
