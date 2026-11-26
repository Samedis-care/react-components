/**
 * The route pattern {@link matchPath} matches a location against
 */
export interface PathPattern {
	/**
	 * The route path
	 */
	path: string;
	/**
	 * Case-sensitive matching
	 */
	caseSensitive?: boolean;
	/**
	 * If true: verify that the location matches the route from start to end (unless route ends with wildcard *)
	 * Example: location /hello/world/good does not match path /hello/world if set to true,
	 *          but does match if path is /hello/world/* or location is /hello/world
	 */
	end?: boolean;
}

/**
 * A successful match of {@link matchPath}
 */
export interface PathMatch {
	/**
	 * The url portion matching the route path (route path with parameter values inserted)
	 * It keeps the percent-encoding of the location (as in
	 * `useLocation().pathname`), so a path built from it navigates to the same
	 * segments.
	 */
	url: string;
	/**
	 * The route parameters, one per `:name` of the pattern. A name the pattern
	 * repeats has the value of its last segment: "/t/:id/:id" (the full path of
	 * ":id" nested in "/t/:id/*") gives `{ id: "R9" }` at "/t/T1/R9".
	 * Each value is its location segment percent-decoded, as `decodeURIComponent`
	 * decodes it: "foo bar" for "foo%20bar", "a/b" for "a%2Fb" (an encoded slash
	 * stays inside its param). A segment with a malformed escape ("100%") is
	 * given as it is. Encode a value (`encodeURIComponent`) to put it back into a
	 * path.
	 */
	params: Record<string, string>;
}

/**
 * turn // to / in paths
 * @param path The path to normalize
 */
export const normalizePath = (path: string): string => {
	while (path.includes("//")) path = path.replace("//", "/");
	return path;
};

/**
 * Percent-decodes a path segment, as {@link matchPath} reads the location's
 * segments. RoutedTabs reads its segment with it too, so it selects the Tab
 * whose panel a Route shows. Not exported from the package root.
 * @param segment The segment of a location pathname
 * @returns The decoded segment; the segment as it is if it has a malformed
 * escape
 */
export const decodeSegment = (segment: string): string => {
	if (!segment.includes("%")) return segment;
	try {
		return decodeURIComponent(segment);
	} catch {
		return segment;
	}
};

/**
 * match a location to a route
 * The location's segments are percent-decoded before they are compared to the
 * route's literal segments and given as params, so a location matches the same
 * whether the history keeps it encoded (a browser history: "/%C3%BCber") or as
 * text (a memory history: "/über"). Write a route's literal segments as text
 * ("/über"): they are not decoded.
 * @param pattern the route
 * @param pathname the location pathname
 * @return PathMatch if matched, null if not
 */
const matchPath = (
	pattern: PathPattern,
	pathname: string,
): PathMatch | null => {
	const locSplit = normalizePath(pathname)
		.split("/")
		.filter((x) => !!x);
	const routeSplit = normalizePath(pattern.path)
		.split("/")
		.filter((x) => !!x);
	if (routeSplit.length === 0)
		return locSplit.length === 0 ? { url: "/", params: {} } : null;
	const freeEnd = routeSplit[routeSplit.length - 1] === "*";
	if (pattern.end) {
		if (locSplit.length > routeSplit.length && !freeEnd) return null;
	}
	if (routeSplit.length > locSplit.length && !freeEnd) {
		return null;
	}
	const params: [string, string][] = [];
	for (let i = 0; i < routeSplit.length; ++i) {
		if (routeSplit[i] === "*") continue;
		if (locSplit[i] == null) return null;
		if (routeSplit[i].startsWith(":")) {
			params.push([routeSplit[i].substring(1), decodeSegment(locSplit[i])]);
			continue;
		}
		let r = routeSplit[i];
		let l = decodeSegment(locSplit[i]);
		if (!pattern.caseSensitive) {
			r = r.toLowerCase();
			l = l.toLowerCase();
		}
		if (r !== l) {
			return null;
		}
	}
	return {
		url:
			"/" +
			locSplit
				.slice(0, freeEnd ? routeSplit.length - 1 : routeSplit.length)
				.join("/"),
		params: Object.fromEntries(params),
	};
};

export default matchPath;
