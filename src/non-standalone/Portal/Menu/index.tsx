import React, { useState } from "react";
import { MenuBase } from "../../..";
import {
	IMenuItemDefinition,
	IMenuProps,
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
	onClick?: () => void;
	/**
	 * Children of this menu entry
	 */
	children?: IRoutedMenuItemDefinition[];
}

export interface IRoutedMenuProps
	extends Omit<IMenuProps, "definition" | "customState"> {
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
		!!resolveLocation(definition.children, path, depth + 1),
	children: definition.children?.map((entry) =>
		convertDefinition(entry, path, depth + 1)
	),
	onClick: () => {
		if (definition.onClick) {
			definition.onClick();
		}
		if (definition.route) {
			FrameworkHistory.push(definition.route);
		}
	},
});

/**
 * Returns the internal name used by the menu to set the active state based off the given path
 * @param definitions The menu item definitions
 * @param path The current location.pathname
 * @param depth The depth of the menu item
 * @return The menu item "identifier" used to set the menu item active or undefined if no match has been found
 */
const resolveLocation = (
	definitions: IRoutedMenuItemDefinition[],
	path: string,
	depth: number
): string | null => {
	for (const def of definitions) {
		if (def.route && path.startsWith(def.route)) return depth + def.title;
		if (def.children) {
			const nextLevel = resolveLocation(def.children, path, depth + 1);
			if (nextLevel) return nextLevel;
		}
	}
	return null;
};

export default (props: IRoutedMenuProps) => {
	const controlledState = useState("");
	const location = useLocation();
	const path = location.pathname;

	// set the currently active item based off location
	const menuEntry = resolveLocation(props.definition, path, 0);
	if (menuEntry && controlledState[0] !== menuEntry) {
		controlledState[1](menuEntry);
	}

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
