import { matchPath } from "react-router-dom";

export const doesRouteMatch = (
	route: string,
	path: string,
	exact = false,
	strict = false
): boolean =>
	!!matchPath(path, {
		path: route,
		exact,
		strict,
	});

export const extractRouteParameters = (
	route: string,
	path: string,
	exact = false,
	strict = false
): Record<string, string> => {
	const match = matchPath(path, {
		path: route,
		exact,
		strict,
	});
	if (!match) throw new Error("Route does not match");
	return match.params;
};

export const insertRouteParameters = (
	route: string,
	params: Record<string, string>
): string => {
	let pathParts = route.split("/");
	pathParts = pathParts.map((entry) =>
		entry.startsWith(":") ? params[entry.substr(1)] : entry
	);
	return pathParts.join("/");
};
