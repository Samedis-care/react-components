/**
 * The route pattern {@link matchPath} matches a location against
 */
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
/**
 * A successful match of {@link matchPath}
 */
export interface PathMatch {
    /**
     * The url portion matching the route path (route path with parameter values inserted)
     * It keeps the percent-encoding of the location (as in
     * `useLocation().pathname`), so a path built from it navigates to the same
     * segments.
     */
    url: string;
    /**
     * The route parameters, one per `:name` of the pattern. A name the pattern
     * repeats has the value of its last segment: "/t/:id/:id" (the full path of
     * ":id" nested in "/t/:id/*") gives `{ id: "R9" }` at "/t/T1/R9".
     * Each value is its location segment percent-decoded, as `decodeURIComponent`
     * decodes it: "foo bar" for "foo%20bar", "a/b" for "a%2Fb" (an encoded slash
     * stays inside its param). A segment with a malformed escape ("100%") is
     * given as it is. Encode a value (`encodeURIComponent`) to put it back into a
     * path.
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
 * The location's segments are percent-decoded before they are compared to the
 * route's literal segments and given as params, so a location matches the same
 * whether the history keeps it encoded (a browser history: "/%C3%BCber") or as
 * text (a memory history: "/über"). Write a route's literal segments as text
 * ("/über"): they are not decoded.
 * @param pattern the route
 * @param pathname the location pathname
 * @return PathMatch if matched, null if not
 */
declare const matchPath: (pattern: PathPattern, pathname: string) => PathMatch | null;
export default matchPath;
