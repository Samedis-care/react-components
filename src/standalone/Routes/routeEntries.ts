import React from "react";
import { RouteProps } from "./Route";

/**
 * The entries of a `Routes` in render order: its children with arrays and
 * fragments flattened, the children of a fragment in its place, and without
 * `false`, `null`, `undefined`, strings and numbers. The elements are returned
 * as they are, with their own keys. An element without a string `path` prop
 * stays in the list; `findMatchingRoute` never matches it.
 * `RoutedTabPanelWrapper` reads its entries with this as well, so that it
 * agrees with `Routes` on the entry that is shown.
 * Internal to the routing, not exported from the package root.
 * @param children The children of the `Routes`
 * @returns The entries
 */
const routeEntries = (
	children: React.ReactNode,
): React.ReactElement<RouteProps>[] => {
	const entries: React.ReactElement<RouteProps>[] = [];
	React.Children.forEach(children, (child) => {
		if (!React.isValidElement(child)) return;
		if (child.type === React.Fragment) {
			const fragment = child.props as { children?: React.ReactNode };
			entries.push(...routeEntries(fragment.children));
			return;
		}
		entries.push(child as React.ReactElement<RouteProps>);
	});
	return entries;
};

export default routeEntries;
