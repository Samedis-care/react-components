import React, { useEffect, useState } from "react";
import {
	doesRouteMatch,
	extractRouteParameters,
	insertRouteParameters,
	MenuBase,
} from "../../..";
import {
	IMenuItemDefinition,
	MenuProps,
} from "../../../standalone/Portal/Menu";
import { FrameworkHistory } from "../../../framework";
import { useLocation } from "react-router-dom";

export interface IRoutedMenuItemDefinition
	extends Omit<IMenuItemDefinition, "onClick" | "children"> {
	/**
	 * The URL to navigate to in case the menu item is clicked
	 */
	route?: string;
	/**
	 * An additional onClick action to be executed
	 */
	onClick?: React.MouseEventHandler;
	/**
	 * Children of this menu entry
	 */
	children?: IRoutedMenuItemDefinition[];
}

export interface IRoutedMenuProps
	extends Omit<MenuProps, "definition" | "customState"> {
	/**
	 * The menu definition (with routing support)
	 */
	definition: IRoutedMenuItemDefinition[];
}

/**
 * Extract current route params
 * @param definitions The route definitions
 * @param path The current location.pathname
 */
const getMenuRouteParams = (
	definitions: IRoutedMenuItemDefinition[],
	path: string
): Record<string, string> => {
	// first try and find an exact match
	let exact = true;
	let match = definitions.find(
		(entry) => entry.route && doesRouteMatch(entry.route, path, true)
	);
	if (!match) {
		// if this fails, get the closest match we can get
		exact = false;
		match = definitions
			.sort((a, b) => (b.route?.length ?? 0) - (a.route?.length ?? 0))
			.find((entry) => entry.route && doesRouteMatch(entry.route, path));
	}
	if (!match) return {};
	const route = match.route as string;
	return extractRouteParameters(route, path, exact);
};

/**
 * Converts the routed menu item definitions to normal menu item definitions
 * @param definitions All menu items
 * @param definition The routed menu item definition
 * @param path The current location.pathname
 * @param depth The depth of the menu item
 * @return a normal menu item definition
 */
const convertDefinition = (
	definitions: IRoutedMenuItemDefinition[],
	definition: IRoutedMenuItemDefinition,
	path: string,
	depth: number
): IMenuItemDefinition => ({
	...definition,
	forceExpand:
		definition.children &&
		!!resolveLocation(definition.children, path, depth + 1, null),
	children: definition.children?.map((entry) =>
		convertDefinition(definitions, entry, path, depth + 1)
	),
	onClick: (evt) => {
		if (definition.onClick) {
			definition.onClick(evt);
		}
		if (definition.route) {
			// keep URL parameters
			const target = insertRouteParameters(
				definition.route,
				getMenuRouteParams(definitions, path)
			);
			if (evt.ctrlKey || evt.metaKey || evt.shiftKey)
				window.open(target, "_blank");
			else FrameworkHistory.push(target);
		}
	},
	onAuxClick: (evt) => {
		if (definition.onAuxClick) {
			definition.onAuxClick(evt);
		}
		if (definition.route) {
			// keep URL parameters
			const target = insertRouteParameters(
				definition.route,
				getMenuRouteParams(definitions, path)
			);
			window.open(target);
		}
	},
});

/**
 * Returns the internal name used by the menu to set the active state based off the given path
 * @param definitions The menu item definitions
 * @param path The current location.pathname
 * @param depth The depth of the menu item
 * @param itemId The menu item id
 * @return The menu item "identifier" used to set the menu item active or undefined if no match has been found
 */
const resolveLocation = (
	definitions: IRoutedMenuItemDefinition[],
	path: string,
	depth: number,
	itemId: string | null
): string | null => {
	// first recurse to find the deepest matching link
	for (const def of definitions) {
		if (def.children) {
			const nextLevel = resolveLocation(
				def.children,
				path,
				depth + 1,
				itemId ? `${itemId}@${def.title}` : def.title
			);
			if (nextLevel) return nextLevel;
		}
	}
	// then try this level
	const matchDef = definitions
		.sort((a, b) => (b.route?.length ?? 0) - (a.route?.length ?? 0))
		.find((def) => def.route && doesRouteMatch(def.route, path, false));
	return matchDef
		? itemId
			? `${itemId}@${matchDef.title}`
			: matchDef.title
		: null;
};

const RoutedMenu = (props: IRoutedMenuProps) => {
	const controlledState = useState("");
	const [activeMenuItem, setActiveMenuItem] = controlledState;
	const location = useLocation();
	const path = location.pathname;

	// set the currently active item based off location
	useEffect(() => {
		const menuEntry = resolveLocation(props.definition, path, 0, null);
		if (menuEntry && activeMenuItem !== menuEntry) {
			setActiveMenuItem(menuEntry);
		}
	}, [activeMenuItem, path, props.definition, setActiveMenuItem]);

	// convert routed menu definitions to normal menu definitions
	const rawDef = props.definition;
	const definition = React.useMemo(() => {
		return rawDef.map((entry) => convertDefinition(rawDef, entry, path, 0));
	}, [rawDef, path]);

	return (
		<MenuBase
			{...props}
			definition={definition}
			customState={controlledState}
		/>
	);
};

export default React.memo(RoutedMenu);
