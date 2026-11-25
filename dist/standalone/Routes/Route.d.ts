import React from "react";
export interface RouteProps {
    /**
     * Path of the route. Nested in another Route it is relative to that
     * Route's path: "info" under "/devices/*" or "/devices" is "/devices/info".
     * A `:name` param named like a param of a Route around it hides that
     * Route's value in `useParams` below this Route.
     */
    path: string;
    /**
     * The element to render if the route is matched
     */
    element: React.ReactElement;
}
/**
 * The nearest matched Route, as {@link useRouteInfo} returns it
 */
export interface RouteContextType {
    /**
     * The full route path (including parent routes)
     */
    path: string;
    /**
     * The full route URL (with params)
     */
    url: string;
    /**
     * How many routes this route is nested in, 0 for a top-level route
     */
    depth: number;
    /**
     * Would this route still be rendered at pathname, so that a navigation there keeps it
     * and its element mounted? It would when its path matches pathname, the Routes it is an
     * entry of picks it there (no entry listed before it matches first, e.g. another tab's
     * panel before the default one) and the same holds for every Route around it. Its url
     * may differ there (another value of a param).
     * It stays the same function as long as the route's path does, and answers for the
     * routes as they are rendered at the time of the call.
     * @param pathname A location pathname, e.g. the target of a navigation
     * @returns true if the route is rendered at pathname
     */
    rendersAt: (pathname: string) => boolean;
}
/**
 * The nearest matched Route, null outside of every Route. Read it with
 * {@link useRouteInfo}, or with `useContext` where null is a valid case.
 */
export declare const RouteContext: React.Context<RouteContextType | null>;
/**
 * The path, url and depth of the nearest matched Route.
 * Throws outside of every Route. Dialogs pushed with `useDialogContext` and
 * toasts render outside of every Route, also when they are opened from inside
 * one.
 * @returns The nearest matched Route
 */
export declare const useRouteInfo: () => RouteContextType;
/**
 * The prefix Routes and Route put in front of their child paths: the full
 * path of the enclosing Route with a trailing "/*" replaced by "/", or "/"
 * outside of every Route.
 * Internal to Routes and Route, not exported from the package root.
 */
export declare const useRoutePrefix: () => string;
declare const _default: React.MemoExoticComponent<(props: RouteProps) => React.JSX.Element>;
export default _default;
