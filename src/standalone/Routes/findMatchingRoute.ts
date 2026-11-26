import React from "react";
import { RouteProps } from "./Route";
import matchPath from "./matchPath";
import routePattern from "./routePattern";
import {
	compareRouteSpecificity,
	getRouteSpecificity,
	RouteSpecificity,
} from "./routeSpecificity";

/**
 * The entry that `Routes` renders for a URL: of the entries whose path, joined
 * with the enclosing Route's prefix, matches the URL, the most specific one
 * (compareRouteSpecificity), and on a tie the one listed first. `Routes`
 * renders the entry this returns, and `RoutedTabPanelWrapper` names its panel
 * after it, so both agree on which entry is shown. An entry without a string
 * `path` prop never matches.
 * @param entries The entries, in render order
 * @param routePrefix The prefix from `useRoutePrefix`
 * @param pathname The URL pathname
 * @returns The most specific matching entry, `undefined` when none matches
 */
const findMatchingRoute = <T extends React.ReactElement<RouteProps>>(
	entries: T[],
	routePrefix: string,
	pathname: string,
): T | undefined => {
	let best: { entry: T; specificity: RouteSpecificity } | undefined;
	for (const entry of entries) {
		// any element type-checks as an entry; without a path it would match "/undefined"
		const path: unknown = entry.props.path;
		if (typeof path !== "string") continue;
		const pattern = routePattern(routePrefix, path, entry.props.end);
		if (!matchPath(pattern, pathname)) continue;
		const specificity = getRouteSpecificity(pattern.path);
		if (best && compareRouteSpecificity(specificity, best.specificity) >= 0)
			continue;
		best = { entry, specificity };
	}
	return best?.entry;
};

export default findMatchingRoute;
