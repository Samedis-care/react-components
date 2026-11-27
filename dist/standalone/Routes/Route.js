import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useContext, useEffect, useMemo } from "react";
import useLocation from "./useLocation";
import matchPath from "./matchPath";
import routePattern from "./routePattern";
import { sentrySetRoutePath } from "./SentryRoutingInstrumentation";
import RoutesEntryContext from "./RoutesEntryContext";
import NestedHistoryRouterContext from "./NestedHistoryRouterContext";
/**
 * The nearest matched Route, null outside of every Route. A HistoryRouter
 * starts a fresh routing scope: inside it, outside of its own routes, it is
 * null also within a Route of an outer HistoryRouter. Read it with
 * {@link useRouteInfo}, or with `useContext` where null is a valid case.
 * The value stays the same object while the route's url, path and rendersAt
 * do, so a navigation within the route ("/devices/1" to "/devices/2" under
 * "/devices/*") doesn't re-render the components that read it, unless they
 * read the location too.
 */
export const RouteContext = React.createContext(null);
/**
 * The path, url and depth of the nearest matched Route.
 * Throws outside of every Route. Dialogs pushed with `useDialogContext` and
 * toasts render outside of every Route, also when they are opened from inside
 * one.
 * @returns The nearest matched Route
 */
export const useRouteInfo = () => {
    const ctx = useContext(RouteContext);
    if (!ctx)
        throw new Error("RouteContext missing, did you forget to render this inside a Route? Dialogs pushed with useDialogContext and toasts render outside of every Route.");
    return ctx;
};
/**
 * The prefix Routes and Route put in front of their child paths: the full
 * path of the enclosing Route with a trailing "/*" replaced by "/", or "/"
 * outside of every Route.
 * Internal to Routes and Route, not exported from the package root.
 */
export const useRoutePrefix = () => {
    const routeCtx = useContext(RouteContext);
    return routeCtx ? routeCtx.path.replace(/\/\*$/, "/") : "/";
};
const Route = (props) => {
    const { path, end, element } = props;
    const location = useLocation();
    const { pathname } = location;
    const routePrefix = useRoutePrefix();
    const parentCtx = useContext(RouteContext);
    const depth = parentCtx ? parentCtx.depth + 1 : 0;
    const pattern = useMemo(() => routePattern(routePrefix, path, end), [routePrefix, path, end]);
    const parentRendersAt = parentCtx ? parentCtx.rendersAt : null;
    const entryRenderedAt = useContext(RoutesEntryContext);
    const rendersAt = useCallback((target) => !!matchPath(pattern, target) &&
        (!entryRenderedAt || entryRenderedAt(target)) &&
        (!parentRendersAt || parentRendersAt(target)), [pattern, entryRenderedAt, parentRendersAt]);
    // null: this one is about to be unmounted
    const url = matchPath(pattern, pathname)?.url ?? null;
    // on the url, not the pathname: a navigation within the route ("/devices/1" to
    // "/devices/2" under "/devices/*") keeps the value, so its consumers don't re-render
    const routePath = pattern.path;
    const ctx = useMemo(() => url === null ? null : { url, path: routePath, depth, rendersAt }, [url, routePath, depth, rendersAt]);
    // the routes of a HistoryRouter inside another one leave the Sentry name to the outer one's routes
    const nestedRouter = useContext(NestedHistoryRouterContext);
    // every location, not only every route change: a navigation within this route needs its name too
    useEffect(() => {
        if (ctx && !nestedRouter)
            sentrySetRoutePath(ctx.path, ctx.depth, location);
    }, [ctx, location, nestedRouter]);
    if (!ctx)
        return _jsx(React.Fragment, {});
    return _jsx(RouteContext.Provider, { value: ctx, children: element });
};
export default React.memo(Route);
