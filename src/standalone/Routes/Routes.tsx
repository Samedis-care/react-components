import React, { useMemo } from "react";
import { RouteProps, useRoutePrefix } from "./Route";
import useLocation from "./useLocation";
import findMatchingRoute from "./findMatchingRoute";

/**
 * Props of {@link Routes}
 */
export interface RoutesProps {
	/**
	 * The Route elements; the first whose path matches the current location is
	 * rendered, none if no path matches
	 */
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
	const matchedRoute = findMatchingRoute(
		childrenWithKeys,
		routePrefix,
		pathname,
	);
	return matchedRoute ? matchedRoute : <React.Fragment />;
};

export default React.memo(Routes);
