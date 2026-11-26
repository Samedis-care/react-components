import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
} from "react";
import { RouteContext, useRoutePrefix } from "./Route";
import useLocation from "./useLocation";
import findMatchingRoute from "./findMatchingRoute";
import routeEntries from "./routeEntries";
import RoutesEntryContext from "./RoutesEntryContext";

/**
 * Props of {@link Routes}
 */
export interface RoutesProps {
	/**
	 * The Route elements, as JSX children or in an array. Of those whose path
	 * matches the current location the most specific one is rendered, whatever
	 * the order: "/devices/new/*" before "/devices/*" and before
	 * "/devices/:id/*" at "/devices/new"; on a tie the one listed first (see
	 * `RouteProps.path` for the order). None is rendered if no path matches: add
	 * `<Route path="*" … />` for a not-found page. In development, a Routes
	 * outside of every Route warns in the console when no path matches (once
	 * per path); a nested Routes renders nothing then without a word.
	 * `false`, `null` and `undefined` are skipped, so a conditional route is
	 * `{isAdmin && <Route … />}`, and the children of a fragment take its place,
	 * so a group of routes can be conditional too. Any element with a string
	 * `path` prop takes part, e.g. a component that takes RouteProps and renders
	 * a Route; an element without one is never rendered.
	 *
	 * The rendered child is keyed by its path, and its own key, if it has one,
	 * takes effect as on any element. Switching to another child remounts the
	 * element, and so does a new key on the child that is rendered
	 * (`<Route key={tenantId} … />`). Navigating within the same child (e.g.
	 * "/devices/1" to "/devices/2" under "/devices/:id") keeps it mounted. JSX
	 * children need no keys; in an array, give every child a key, as anywhere in
	 * React (React 18 warns without).
	 */
	children: React.ReactNode;
}

const Routes = (props: RoutesProps) => {
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
	const warnedPaths = useRef<Set<string> | null>(null);
	useEffect(() => {
		if (process.env.NODE_ENV !== "development" || !unmatched) return;
		if (!warnedPaths.current) warnedPaths.current = new Set();
		if (warnedPaths.current.has(pathname)) return;
		warnedPaths.current.add(pathname);
		// eslint-disable-next-line no-console
		console.warn(
			`Routes: no route matches the location "${pathname}", so nothing is rendered. Add <Route path="*" … /> for a not-found page.`,
		);
	}, [unmatched, pathname]);
	// the entries are new elements on most renders: the check for another pathname reads the
	// latest ones, so that it can stay the same function (see RoutesEntryContext)
	const latest = useRef({ entries, routePrefix });
	latest.current = { entries, routePrefix };
	// the rendered entry is keyed by its path, so the same path at pathname keeps the entry
	// mounted; its own key, which is part of its identity too, does not depend on the
	// pathname
	const matchedPath = matchedRoute ? matchedRoute.props.path : null;
	const rendersEntryAt = useCallback(
		(target: string) =>
			findMatchingRoute(
				latest.current.entries,
				latest.current.routePrefix,
				target,
			)?.props.path === matchedPath,
		[matchedPath],
	);
	if (!matchedRoute) return <React.Fragment />;
	return (
		<RoutesEntryContext.Provider value={rendersEntryAt}>
			<React.Fragment key={matchedPath}>{matchedRoute}</React.Fragment>
		</RoutesEntryContext.Provider>
	);
};

export default React.memo(Routes);
