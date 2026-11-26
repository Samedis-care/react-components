import { Location, Update } from "history";

/**
 * Follows the routing of the outermost HistoryRouter and its Routes; a HistoryRouter inside another
 * one and its Routes report nothing. Registered by componentsCareBrowserTracingIntegration
 * (components-care/dist/sentry), so this module doesn't depend on Sentry, an optional peer dependency.
 * This module is internal: none of it is exported from the package root.
 */
export interface RoutingInstrumentation {
	/**
	 * Called for every history update
	 * @param update The update
	 */
	handleNavigation: (update: Update) => void;
	/**
	 * Names the current location after a route
	 * @param routePath The full route path (including parent routes)
	 */
	setRoutePath: (routePath: string) => void;
}

let instrumentation: RoutingInstrumentation | null = null;

/**
 * Sets the instrumentation that follows the routing. Called by
 * componentsCareBrowserTracingIntegration.
 * @param value The instrumentation, null to remove it
 */
export function setRoutingInstrumentation(
	value: RoutingInstrumentation | null,
): void {
	instrumentation = value;
}

// the route that named the current location, see sentrySetRoutePath
let namedBy: { location: Location; depth: number } | null = null;

/**
 * Names the current location after a matched route. Every matched Route reports itself for every
 * location, and the deepest one wins, so nested routes name it after the full route (parent
 * effects run after child effects). Called by the Routes of the outermost HistoryRouter.
 * @param routePath The full route path (including parent routes)
 * @param depth How many routes the route is nested in
 * @param location The location the route matched
 */
export function sentrySetRoutePath(
	routePath: string,
	depth: number,
	location: Location,
): void {
	if (!instrumentation) return;
	if (namedBy && namedBy.location === location && namedBy.depth > depth) return;
	namedBy = { location, depth };
	instrumentation.setRoutePath(routePath);
}

/**
 * Reports a history update. Called by the outermost HistoryRouter.
 * @param update The update
 */
export function sentryHandleNavigation(update: Update): void {
	instrumentation?.handleNavigation(update);
}
