import { matchPath, UNSAFE_RouteContext } from "react-router-dom";
import React from "react";
import { RouteMatch } from "react-router/lib/router";

export const doesRouteMatch = (
	route: string,
	path: string,
	exact = false,
	strict = false
): boolean =>
	!!matchPath({ path: route, caseSensitive: strict, end: exact }, path);

export const extractRouteParameters = (
	route: string,
	path: string,
	exact = false,
	strict = false
): Record<string, string> => {
	const match = matchPath(
		{ path: route, caseSensitive: strict, end: exact },
		path
	);
	if (!match) throw new Error("Route does not match");
	return match.params as Record<string, string>;
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

const reconstructPath = (matches: RouteMatch[]) => {
	const path = matches[matches.length - 1].route.path;
	return path
		? path.endsWith("/*")
			? path.slice(0, -1)
			: path
			? path + "/"
			: ""
		: "";
};

interface RouteContextObject {
	outlet: React.ReactElement | null;
	matches: RouteMatch[];
}
const findLastNode = (node: RouteContextObject): RouteContextObject =>
	node.outlet
		? findLastNode((node.outlet.props as { value: RouteContextObject }).value)
		: node;

export const useRouteInfo = () => {
	const routeInfo = findLastNode(React.useContext(UNSAFE_RouteContext));
	return {
		route: reconstructPath(routeInfo.matches),
		url: routeInfo.matches[routeInfo.matches.length - 1].pathnameBase,
	};
};
