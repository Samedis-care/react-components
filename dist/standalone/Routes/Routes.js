import React from "react";
import { useRoutePrefix } from "./Route";
import useLocation from "./useLocation";
import matchPath from "./matchPath";
const Routes = (props) => {
    const { children } = props;
    const { pathname } = useLocation();
    const routePrefix = useRoutePrefix();
    const matchedRoutes = children.filter((child) => !!matchPath({ ...child.props, path: routePrefix + child.props.path }, pathname));
    const matchedRoute = matchedRoutes[0];
    return matchedRoute ? matchedRoute : React.createElement(React.Fragment, null);
};
export default React.memo(Routes);
