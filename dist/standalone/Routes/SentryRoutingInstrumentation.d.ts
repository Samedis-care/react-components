import { Location, Update } from "history";
/**
 * Follows the routing of HistoryRouter and Route. Registered by componentsCareBrowserTracingIntegration
 * (components-care/dist/sentry), so this module doesn't depend on Sentry, an optional peer dependency.
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
/**
 * Sets the instrumentation that follows the routing
 * @param value The instrumentation, null to remove it
 */
export declare function setRoutingInstrumentation(value: RoutingInstrumentation | null): void;
/**
 * Names the current location after a matched route. Every matched Route reports itself for every
 * location, and the deepest one wins, so nested routes name it after the full route (parent
 * effects run after child effects).
 * @param routePath The full route path (including parent routes)
 * @param depth How many routes the route is nested in
 * @param location The location the route matched
 */
export declare function sentrySetRoutePath(routePath: string, depth: number, location: Location): void;
/**
 * Reports a history update
 * @param update The update
 */
export declare function sentryHandleNavigation(update: Update): void;
