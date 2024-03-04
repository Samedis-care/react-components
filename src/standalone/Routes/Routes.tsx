import React from "react";
import { RouteProps, useRoutePrefix } from "./Route";
import useLocation from "./useLocation";
import matchPath from "./matchPath";

export interface RoutesProps {
	children: React.ReactElement<RouteProps>[];
}

const Routes = (props: RoutesProps) => {
	const { children } = props;
	const { pathname } = useLocation();
	const routePrefix = useRoutePrefix();
	const matchedRoutes = children.filter(
		(child) =>
			!!matchPath(
				{ ...child.props, path: routePrefix + child.props.path },
				pathname,
			),
	);
	const matchedRoute = matchedRoutes[0];
	return matchedRoute ? matchedRoute : <React.Fragment />;
};

export default React.memo(Routes);
