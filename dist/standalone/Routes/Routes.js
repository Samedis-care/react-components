import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useMemo, useRef } from "react";
import { useRoutePrefix } from "./Route";
import useLocation from "./useLocation";
import findMatchingRoute from "./findMatchingRoute";
import RoutesEntryContext from "./RoutesEntryContext";
const Routes = (props) => {
    const { children } = props;
    const { pathname } = useLocation();
    const routePrefix = useRoutePrefix();
    const childrenWithKeys = useMemo(() => {
        return children.map((child) => React.cloneElement(child, { key: child.props.path }));
    }, [children]);
    const matchedRoute = findMatchingRoute(childrenWithKeys, routePrefix, pathname);
    // the entries are new elements on most renders: the check for another pathname reads the
    // latest ones, so that it can stay the same function (see RoutesEntryContext)
    const latest = useRef({ entries: childrenWithKeys, routePrefix });
    latest.current = { entries: childrenWithKeys, routePrefix };
    // entries are keyed by their path, so the same path at pathname keeps the entry mounted
    const matchedPath = matchedRoute ? matchedRoute.props.path : null;
    const rendersEntryAt = useCallback((target) => findMatchingRoute(latest.current.entries, latest.current.routePrefix, target)?.props.path === matchedPath, [matchedPath]);
    if (!matchedRoute)
        return _jsx(React.Fragment, {});
    return (_jsx(RoutesEntryContext.Provider, { value: rendersEntryAt, children: matchedRoute }));
};
export default React.memo(Routes);
