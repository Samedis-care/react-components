import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useContext, useEffect, useMemo, useRef, } from "react";
import { RouteContext, useRoutePrefix } from "./Route";
import useLocation from "./useLocation";
import findMatchingRoute from "./findMatchingRoute";
import routeEntries from "./routeEntries";
import RoutesEntryContext from "./RoutesEntryContext";
const Routes = (props) => {
    const { children } = props;
    const { pathname } = useLocation();
    const routePrefix = useRoutePrefix();
    const parentRoute = useContext(RouteContext);
    const entries = useMemo(() => routeEntries(children), [children]);
    const matchedRoute = findMatchingRoute(entries, routePrefix, pathname);
    // development: name a location that no route of a top-level Routes matches, once per
    // path, as react-router does; a nested Routes may match nothing on purpose (CRUD's on
    // its grid page)
    const unmatched = !matchedRoute && !parentRoute;
    const warnedPaths = useRef(null);
    useEffect(() => {
        if (process.env.NODE_ENV !== "development" || !unmatched)
            return;
        if (!warnedPaths.current)
            warnedPaths.current = new Set();
        if (warnedPaths.current.has(pathname))
            return;
        warnedPaths.current.add(pathname);
        // eslint-disable-next-line no-console
        console.warn(`Routes: no route matches the location "${pathname}", so nothing is rendered. Add <Route path="*" … /> for a not-found page.`);
    }, [unmatched, pathname]);
    // the entries are new elements on most renders: the check for another pathname reads the
    // latest ones, so that it can stay the same function (see RoutesEntryContext)
    const latest = useRef({ entries, routePrefix });
    latest.current = { entries, routePrefix };
    // the rendered entry is keyed by its path, so the same path at pathname keeps the entry
    // mounted; its own key, which is part of its identity too, does not depend on the
    // pathname
    const matchedPath = matchedRoute ? matchedRoute.props.path : null;
    const rendersEntryAt = useCallback((target) => findMatchingRoute(latest.current.entries, latest.current.routePrefix, target)?.props.path === matchedPath, [matchedPath]);
    if (!matchedRoute)
        return _jsx(React.Fragment, {});
    return (_jsx(RoutesEntryContext.Provider, { value: rendersEntryAt, children: _jsx(React.Fragment, { children: matchedRoute }, matchedPath) }));
};
export default React.memo(Routes);
