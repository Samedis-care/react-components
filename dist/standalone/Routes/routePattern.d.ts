import { PathPattern } from "./matchPath";
/**
 * The pattern a Route is matched with, by the Route itself and by the Routes
 * it is a child of: its full path and whether it has to match the whole
 * location. A Route with `end` has to, and so does a path without segments
 * ("" or "/"), which therefore matches only its parent's own url, at every
 * level, as "/" matches only "/" at the top level.
 * Internal to the routing, not exported from the package root.
 * @param prefix The prefix from useRoutePrefix
 * @param path The Route's path, relative to the enclosing Route
 * @param end The Route's `end` prop
 * @returns The pattern for matchPath
 */
declare const routePattern: (prefix: string, path: string, end: boolean | undefined) => PathPattern;
export default routePattern;
