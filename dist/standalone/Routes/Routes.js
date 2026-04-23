import { jsx as _jsx } from "react/jsx-runtime";
import React, { useMemo } from "react";
import { useRoutePrefix } from "./Route";
import useLocation from "./useLocation";
import matchPath from "./matchPath";
const Routes = (props) => {
    const { children } = props;
    const { pathname } = useLocation();
    const routePrefix = useRoutePrefix();
    const childrenWithKeys = useMemo(() => {
        return children.map((child) => React.cloneElement(child, { key: child.props.path }));
    }, [children]);
    const matchedRoutes = childrenWithKeys.filter((child) => !!matchPath({ ...child.props, path: routePrefix + child.props.path }, pathname));
    const matchedRoute = matchedRoutes[0];
    return matchedRoute ? matchedRoute : _jsx(React.Fragment, {});
};
export default React.memo(Routes);
