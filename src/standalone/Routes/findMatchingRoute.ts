import React from "react";
import { RouteProps } from "./Route";
import joinRoutePath from "./joinRoutePath";
import matchPath from "./matchPath";

/**
 * The entry that `Routes` renders for a URL: the first whose path, joined with
 * the enclosing Route's prefix, matches the URL. `Routes` renders the entry
 * this returns, and `RoutedTabPanelWrapper` names its panel after it, so both
 * agree on which entry is shown. An entry without a string `path` prop never
 * matches.
 * @param entries The entries, in render order
 * @param routePrefix The prefix from `useRoutePrefix`
 * @param pathname The URL pathname
 * @returns The first matching entry, `undefined` when none matches
 */
const findMatchingRoute = <T extends React.ReactElement<RouteProps>>(
	entries: T[],
	routePrefix: string,
	pathname: string,
): T | undefined =>
	entries.find((entry) => {
		// any element type-checks as an entry; without a path it would match "/undefined"
		const path: unknown = entry.props.path;
		return (
			typeof path === "string" &&
			!!matchPath(
				{ ...entry.props, path: joinRoutePath(routePrefix, path) },
				pathname,
			)
		);
	});

export default findMatchingRoute;
