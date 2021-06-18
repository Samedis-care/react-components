import React, { useEffect, useState } from "react";
import { MenuBase } from "../../..";
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
 * Converts the routed menu item definitions to normal menu item definitions
 * @param definition The routeed menu item definition
 * @param path The current location.pathname
 * @param depth The depth of the menu item
 * @return a normal menu item definition
 */
const convertDefinition = (
	definition: IRoutedMenuItemDefinition,
	path: string,
	depth: number
): IMenuItemDefinition => ({
	...definition,
	forceExpand:
		definition.children &&
		!!resolveLocation(definition.children, path, depth + 1, null),
	children: definition.children?.map((entry) =>
		convertDefinition(entry, path, depth + 1)
	),
	onClick: (evt) => {
		if (definition.onClick) {
			definition.onClick(evt);
		}
		if (definition.route) {
			if (evt.ctrlKey || evt.metaKey || evt.shiftKey)
				window.open(definition.route, "_blank");
			else FrameworkHistory.push(definition.route);
		}
	},
	onAuxClick: (evt) => {
		if (definition.onAuxClick) {
			definition.onAuxClick(evt);
		}
		if (definition.route) {
			window.open(definition.route);
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
	for (const def of definitions) {
		if (def.route && path.startsWith(def.route)) {
			return itemId ? `${itemId}@${def.title}` : def.title;
		}
	}
	// and if nothing found
	return null;
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
		return rawDef.map((entry) => convertDefinition(entry, path, 0));
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
