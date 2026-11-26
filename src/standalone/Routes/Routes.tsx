import React, { useCallback, useMemo, useRef } from "react";
import { useRoutePrefix } from "./Route";
import useLocation from "./useLocation";
import findMatchingRoute from "./findMatchingRoute";
import routeEntries from "./routeEntries";
import RoutesEntryContext from "./RoutesEntryContext";

/**
 * Props of {@link Routes}
 */
export interface RoutesProps {
	/**
	 * The Route elements, as JSX children or in an array; the first whose path
	 * matches the current location is rendered, none if no path matches.
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
	const entries = useMemo(() => routeEntries(children), [children]);
	const matchedRoute = findMatchingRoute(entries, routePrefix, pathname);
	// the entries are new elements on most renders: the check for another pathname reads the
	// latest ones, so that it can stay the same function (see RoutesEntryContext)
	const latest = useRef({ entries, routePrefix });
	latest.current = { entries, routePrefix };
	// the rendered entry is keyed by its path, so the same path at pathname keeps the entry
	// mounted (only the first entry with a path can match); its own key, which is part of its
	// identity too, does not depend on the pathname
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
