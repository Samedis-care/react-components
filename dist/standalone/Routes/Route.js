import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useContext, useEffect, useMemo } from "react";
import useLocation from "./useLocation";
import matchPath from "./matchPath";
import joinRoutePath from "./joinRoutePath";
import { sentrySetRoutePath } from "./SentryRoutingInstrumentation";
import RoutesEntryContext from "./RoutesEntryContext";
/**
 * The nearest matched Route, null outside of every Route. Read it with
 * {@link useRouteInfo}, or with `useContext` where null is a valid case.
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
    const { path, element } = props;
    const location = useLocation();
    const { pathname } = location;
    const routePrefix = useRoutePrefix();
    const parentCtx = useContext(RouteContext);
    const depth = parentCtx ? parentCtx.depth + 1 : 0;
    const finalPath = joinRoutePath(routePrefix, path);
    const parentRendersAt = parentCtx ? parentCtx.rendersAt : null;
    const entryRenderedAt = useContext(RoutesEntryContext);
    const rendersAt = useCallback((target) => !!matchPath({ path: finalPath }, target) &&
        (!entryRenderedAt || entryRenderedAt(target)) &&
        (!parentRendersAt || parentRendersAt(target)), [finalPath, entryRenderedAt, parentRendersAt]);
    const ctx = useMemo(() => {
        const match = matchPath({ path: finalPath }, pathname);
        if (!match)
            return null; // this one is about to be unmounted
        return { url: match.url, path: finalPath, depth, rendersAt };
    }, [finalPath, pathname, depth, rendersAt]);
    // every location, not only every route change: a navigation within this route needs its name too
    useEffect(() => {
        if (ctx)
            sentrySetRoutePath(ctx.path, ctx.depth, location);
    }, [ctx, location]);
    if (!ctx)
        return _jsx(React.Fragment, {});
    return _jsx(RouteContext.Provider, { value: ctx, children: element });
};
export default React.memo(Route);
