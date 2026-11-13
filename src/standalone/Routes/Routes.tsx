import React, { useMemo } from "react";
import { RouteProps, useRoutePrefix } from "./Route";
import useLocation from "./useLocation";
import matchPath from "./matchPath";
import joinRoutePath from "./joinRoutePath";

export interface RoutesProps {
	children: React.ReactElement<RouteProps>[];
}

const Routes = (props: RoutesProps) => {
	const { children } = props;
	const { pathname } = useLocation();
	const routePrefix = useRoutePrefix();
	const childrenWithKeys = useMemo(() => {
		return children.map((child) =>
			React.cloneElement(child, { key: child.props.path }),
		);
	}, [children]);
	const matchedRoutes = childrenWithKeys.filter(
		(child) =>
			!!matchPath(
				{ ...child.props, path: joinRoutePath(routePrefix, child.props.path) },
				pathname,
			),
	);
	const matchedRoute = matchedRoutes[0];
	return matchedRoute ? matchedRoute : <React.Fragment />;
};

export default React.memo(Routes);
