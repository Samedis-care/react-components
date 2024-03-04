import React, { useContext, useMemo } from "react";
import useLocation from "./useLocation";
import matchPath, { normalizePath } from "./matchPath";

export interface RouteProps {
	/**
	 * Path of the route
	 */
	path: string;
	/**
	 * The element to render if the route is matched
	 */
	element: React.ReactElement;
}

interface RouteContextType {
	/**
	 * The full route path (including parent routes)
	 */
	path: string;
	/**
	 * The full route URL (with params)
	 */
	url: string;
}

export const RouteContext = React.createContext<RouteContextType | null>(null);
/**
 * @returns NonNullable<RouteContextType>
 */
export const useRouteInfo = () => {
	const ctx = useContext(RouteContext);
	if (!ctx) throw new Error("RouteContext missing");
	return ctx;
};

/**
 * Use parent route path
 */
export const useRoutePrefix = () => {
	const routeCtx = useContext(RouteContext);
	return routeCtx ? routeCtx.path.replace(/\/\*$/, "/") : "/";
};

const Route = (props: RouteProps) => {
	const { path, element } = props;
	const { pathname } = useLocation();
	const routePrefix = useRoutePrefix();
	const ctx = useMemo((): RouteContextType | null => {
		const finalPath = normalizePath(routePrefix + path);
		const match = matchPath({ path: finalPath }, pathname);
		if (!match) return null; // this one is about to be unmounted
		return { url: match.url, path: finalPath };
	}, [path, pathname, routePrefix]);

	if (!ctx) return <React.Fragment />;
	return <RouteContext.Provider value={ctx}>{element}</RouteContext.Provider>;
};

export default React.memo(Route);
