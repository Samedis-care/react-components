import { jsx as _jsx } from "react/jsx-runtime";
import React, { useContext, useEffect, useMemo } from "react";
import useLocation from "./useLocation";
import matchPath, { normalizePath } from "./matchPath";
import { sentrySetRoutePath } from "./SentryRoutingInstrumentation";
export const RouteContext = React.createContext(null);
/**
 * @returns NonNullable<RouteContextType>
 */
export const useRouteInfo = () => {
    const ctx = useContext(RouteContext);
    if (!ctx)
        throw new Error("RouteContext missing");
    return ctx;
};
/**
 * Use parent route path
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
    const ctx = useMemo(() => {
        const finalPath = normalizePath(routePrefix + path);
        const match = matchPath({ path: finalPath }, pathname);
        if (!match)
            return null; // this one is about to be unmounted
        return { url: match.url, path: finalPath, depth };
    }, [path, pathname, routePrefix, depth]);
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
