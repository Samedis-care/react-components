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

export interface PathMatch {
	/**
	 * The url portion matching the route path (route path with parameter values inserted)
	 */
	url: string;
	/**
	 * The route parameters
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
 * match a location to a route
 * @param pattern the route
 * @param pathname the location pathname
 * @return PathMatch if matched, null if not
 */
const matchPath = (
	pattern: PathPattern,
	pathname: string,
): PathMatch | null => {
	const locSplit = normalizePath(pathname).split("/");
	const routeSplit = normalizePath(pattern.path).split("/");
	if (routeSplit.length === 0) return null;
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
			params.push([routeSplit[i].substring(1), locSplit[i]]);
			continue;
		}
		let r = routeSplit[i];
		let l = locSplit[i];
		if (!pattern.caseSensitive) {
			r = r.toLowerCase();
			l = l.toLowerCase();
		}
		if (r !== l) {
			return null;
		}
	}
	return {
		url: locSplit
			.slice(0, freeEnd ? routeSplit.length - 1 : routeSplit.length)
			.join("/"),
		params: Object.fromEntries(params),
	};
};

export default matchPath;
