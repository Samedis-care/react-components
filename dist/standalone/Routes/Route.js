import React, { useContext, useMemo } from "react";
import useLocation from "./useLocation";
import matchPath, { normalizePath } from "./matchPath";
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
    const { pathname } = useLocation();
    const routePrefix = useRoutePrefix();
    const ctx = useMemo(() => {
        const finalPath = normalizePath(routePrefix + path);
        const match = matchPath({ path: finalPath }, pathname);
        if (!match)
            return null; // this one is about to be unmounted
        return { url: match.url, path: finalPath };
    }, [path, pathname, routePrefix]);
    if (!ctx)
        return React.createElement(React.Fragment, null);
    return React.createElement(RouteContext.Provider, { value: ctx }, element);
};
export default React.memo(Route);
