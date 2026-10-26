let instrumentation = null;
/**
 * Sets the instrumentation that follows the routing
 * @param value The instrumentation, null to remove it
 */
export function setRoutingInstrumentation(value) {
    instrumentation = value;
}
// the route that named the current location, see sentrySetRoutePath
let namedBy = null;
/**
 * Names the current location after a matched route. Every matched Route reports itself for every
 * location, and the deepest one wins, so nested routes name it after the full route (parent
 * effects run after child effects).
 * @param routePath The full route path (including parent routes)
 * @param depth How many routes the route is nested in
 * @param location The location the route matched
 */
export function sentrySetRoutePath(routePath, depth, location) {
    if (!instrumentation)
        return;
    if (namedBy && namedBy.location === location && namedBy.depth > depth)
        return;
    namedBy = { location, depth };
    instrumentation.setRoutePath(routePath);
}
/**
 * Reports a history update
 * @param update The update
 */
export function sentryHandleNavigation(update) {
    instrumentation?.handleNavigation(update);
}
