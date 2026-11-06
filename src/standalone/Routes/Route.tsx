import React, { useContext, useEffect, useMemo } from "react";
import useLocation from "./useLocation";
import matchPath, { normalizePath } from "./matchPath";
import { sentrySetRoutePath } from "./SentryRoutingInstrumentation";
import { useRegisterPageTitle } from "./PageTitle";

export interface RouteProps {
	/**
	 * Path of the route
	 */
	path: string;
	/**
	 * The element to render if the route is matched
	 */
	element: React.ReactElement;
	/**
	 * The name of the page this route shows, already translated, e.g.
	 * "Inventory". While the route matches, it names the page in the document
	 * title, by default "Inventory – <app title>" (see
	 * `HistoryRouterProps.formatDocumentTitle`), so that browser tabs, the
	 * history and screen readers tell the pages apart.
	 * The most specific title names the page: a nested route's title, or a
	 * `usePageTitle` call inside `element`, wins over this one.
	 * Default: none, the titles of the enclosing routes apply.
	 */
	title?: string;
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
	/**
	 * How many routes this route is nested in, 0 for a top-level route
	 */
	depth: number;
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
	const { path, element, title } = props;
	const location = useLocation();
	const { pathname } = location;
	const routePrefix = useRoutePrefix();
	const parentCtx = useContext(RouteContext);
	const depth = parentCtx ? parentCtx.depth + 1 : 0;
	const ctx = useMemo((): RouteContextType | null => {
		const finalPath = normalizePath(routePrefix + path);
		const match = matchPath({ path: finalPath }, pathname);
		if (!match) return null; // this one is about to be unmounted
		return { url: match.url, path: finalPath, depth };
	}, [path, pathname, routePrefix, depth]);

	// every location, not only every route change: a navigation within this route needs its name too
	useEffect(() => {
		if (ctx) sentrySetRoutePath(ctx.path, ctx.depth, location);
	}, [ctx, location]);

	useRegisterPageTitle(ctx ? title : null, depth * 2);

	if (!ctx) return <React.Fragment />;
	return <RouteContext.Provider value={ctx}>{element}</RouteContext.Provider>;
};

export default React.memo(Route);
