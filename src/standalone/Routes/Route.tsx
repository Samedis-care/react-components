import React, { useCallback, useContext, useEffect, useMemo } from "react";
import useLocation from "./useLocation";
import matchPath from "./matchPath";
import routePattern from "./routePattern";
import { sentrySetRoutePath } from "./SentryRoutingInstrumentation";
import RoutesEntryContext from "./RoutesEntryContext";

export interface RouteProps {
	/**
	 * Path of the route. Nested in another Route of the same HistoryRouter it is
	 * relative to that Route's path: "info" under "/devices/*" or "/devices" is
	 * "/devices/info".
	 * Its segments are literals, compared case-insensitively, `:name` params,
	 * which match one segment each and are read with `useParams`, and `*`,
	 * which as the last segment matches the rest of the location, including
	 * nothing.
	 * A path matches as a prefix of the location: "/devices" also matches
	 * "/devices/1/edit" (see `end`). A path without segments, "" or "/", matches
	 * only the url of the Route around it, at the top level only "/"; `*` is the
	 * catch-all, e.g. for a not-found page.
	 * Of the children of a Routes that match a location, Routes renders the most
	 * specific one, whatever their order: the path with more segments, then,
	 * segment by segment from the left, a literal before a `:name` param before
	 * a `*` ("/devices/new" before "/devices/:id"), then a path without a
	 * trailing "/*" before the same path with one; on a tie the child listed
	 * first.
	 * A `:name` param named like a param of a Route around it hides that
	 * Route's value in `useParams` below this Route.
	 */
	path: string;
	/**
	 * Match only the whole location: with `end`, "/devices" matches "/devices"
	 * and "/devices/" but not "/devices/1". A trailing "/*" still matches the
	 * rest. Taken into account by the Route itself, the Routes it is a child of
	 * and `rendersAt`.
	 * Default: false, the path matches as a prefix of the location (always
	 * true for a path without segments, see `path`)
	 */
	end?: boolean;
	/**
	 * The element to render if the route is matched
	 */
	element: React.ReactElement;
}

/**
 * The nearest matched Route, as {@link useRouteInfo} returns it
 */
export interface RouteContextType {
	/**
	 * The full route path (including parent routes)
	 */
	path: string;
	/**
	 * The full route URL (with params)
	 */
	url: string;
	/**
	 * How many routes of its HistoryRouter this route is nested in, 0 for a
	 * top-level route (also in a HistoryRouter rendered inside a Route of
	 * another one)
	 */
	depth: number;
	/**
	 * Would this route still be rendered at pathname, so that a navigation there keeps it
	 * and its element mounted? It would when its path matches pathname (honouring `end`),
	 * the Routes it is an entry of picks it there (no more specific entry matches there,
	 * e.g. another tab's panel instead of the default one) and the same holds for every
	 * Route around it. Its url may differ there (another value of a param).
	 * It stays the same function as long as the route's path and `end` do, and answers for
	 * the routes as they are rendered at the time of the call.
	 * @param pathname A location pathname, e.g. the target of a navigation
	 * @returns true if the route is rendered at pathname
	 */
	rendersAt: (pathname: string) => boolean;
}

/**
 * The nearest matched Route, null outside of every Route. A HistoryRouter
 * starts a fresh routing scope: inside it, outside of its own routes, it is
 * null also within a Route of an outer HistoryRouter. Read it with
 * {@link useRouteInfo}, or with `useContext` where null is a valid case.
 * The value stays the same object while the route's url, path and rendersAt
 * do, so a navigation within the route ("/devices/1" to "/devices/2" under
 * "/devices/*") doesn't re-render the components that read it, unless they
 * read the location too.
 */
export const RouteContext = React.createContext<RouteContextType | null>(null);
/**
 * The path, url and depth of the nearest matched Route.
 * Throws outside of every Route. Dialogs pushed with `useDialogContext` and
 * toasts render outside of every Route, also when they are opened from inside
 * one.
 * @returns The nearest matched Route
 */
export const useRouteInfo = (): RouteContextType => {
	const ctx = useContext(RouteContext);
	if (!ctx)
		throw new Error(
			"RouteContext missing, did you forget to render this inside a Route? Dialogs pushed with useDialogContext and toasts render outside of every Route.",
		);
	return ctx;
};

/**
 * The prefix Routes and Route put in front of their child paths: the full
 * path of the enclosing Route with a trailing "/*" replaced by "/", or "/"
 * outside of every Route.
 * Internal to Routes and Route, not exported from the package root.
 */
export const useRoutePrefix = () => {
	const routeCtx = useContext(RouteContext);
	return routeCtx ? routeCtx.path.replace(/\/\*$/, "/") : "/";
};

const Route = (props: RouteProps) => {
	const { path, end, element } = props;
	const location = useLocation();
	const { pathname } = location;
	const routePrefix = useRoutePrefix();
	const parentCtx = useContext(RouteContext);
	const depth = parentCtx ? parentCtx.depth + 1 : 0;
	const pattern = useMemo(
		() => routePattern(routePrefix, path, end),
		[routePrefix, path, end],
	);
	const parentRendersAt = parentCtx ? parentCtx.rendersAt : null;
	const entryRenderedAt = useContext(RoutesEntryContext);
	const rendersAt = useCallback(
		(target: string) =>
			!!matchPath(pattern, target) &&
			(!entryRenderedAt || entryRenderedAt(target)) &&
			(!parentRendersAt || parentRendersAt(target)),
		[pattern, entryRenderedAt, parentRendersAt],
	);
	// null: this one is about to be unmounted
	const url = matchPath(pattern, pathname)?.url ?? null;
	// on the url, not the pathname: a navigation within the route ("/devices/1" to
	// "/devices/2" under "/devices/*") keeps the value, so its consumers don't re-render
	const routePath = pattern.path;
	const ctx = useMemo(
		(): RouteContextType | null =>
			url === null ? null : { url, path: routePath, depth, rendersAt },
		[url, routePath, depth, rendersAt],
	);

	// every location, not only every route change: a navigation within this route needs its name too
	useEffect(() => {
		if (ctx) sentrySetRoutePath(ctx.path, ctx.depth, location);
	}, [ctx, location]);

	if (!ctx) return <React.Fragment />;
	return <RouteContext.Provider value={ctx}>{element}</RouteContext.Provider>;
};

export default React.memo(Route);
