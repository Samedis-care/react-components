import React from "react";
import { MenuBase } from "../../..";
import {
	IMenuItemDefinition,
	IMenuProps,
} from "../../../standalone/Portal/Menu";
import { FrameworkHistory } from "../../../framework";

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

export interface IRoutedMenuProps extends Omit<IMenuProps, "definition"> {
	/**
	 * The menu definition (with routing support)
	 */
	definition: IRoutedMenuItemDefinition[];
}

const convertDefinition = (
	definition: IRoutedMenuItemDefinition
): IMenuItemDefinition => ({
	...definition,
	children: definition.children?.map(convertDefinition),
	onClick: () => {
		if (definition.onClick) {
			definition.onClick();
		}
		if (definition.route) {
			FrameworkHistory.push(definition.route);
		}
	},
});

export default (props: IRoutedMenuProps) => {
	return (
		<MenuBase {...props} definition={props.definition.map(convertDefinition)} />
	);
};
