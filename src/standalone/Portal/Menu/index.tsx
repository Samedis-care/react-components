import React, { Dispatch, SetStateAction, useRef, useState } from "react";
import {
	MenuContext,
	MenuEntryElementsContext,
	toMenuItemComponent,
} from "./MenuItem";
import useMenuFocusRestore from "./useMenuFocusRestore";
import { SvgIconComponent } from "@mui/icons-material";
import combineClassNames from "../../../utils/combineClassNames";
import { styled, SvgIconProps, useThemeProps } from "@mui/material";

/**
 * Properties of the Wrapper
 */
export interface IMenuWrapperProps {
	/**
	 * The actual menu entries
	 */
	children: React.ReactNode;
}

/**
 * Properties of a menu item component
 */
export interface MenuItemProps {
	/**
	 * An optional icon
	 */
	icon?: SvgIconComponent | React.ComponentType<SvgIconProps>;
	/**
	 * The text of the menu entry
	 */
	title: string;
	/**
	 * The onClick handler
	 */
	onClick: React.MouseEventHandler;
	/**
	 * Middle-click handler
	 *
	 * Put it on the entry's element as `onAuxClick`. MenuBase passes the
	 * `auxclick` event on to the definition's `onAuxClick` for the middle button
	 * (`button === 1`) only; the right, back and forward buttons, for which
	 * browsers fire `auxclick` too, are dropped.
	 */
	onAuxClick: React.MouseEventHandler;
	/**
	 * Is this menu entry expandable? (does it have children?)
	 */
	expandable: boolean;
	/**
	 * Is this menu item currently selected/active
	 */
	active?: boolean; // set if expandable == false
	/**
	 * Is this menu item currently expanded
	 */
	expanded?: boolean; // set if expandable == true
	/**
	 * The depth in the menu tree
	 */
	depth: number;
	/**
	 * Ref callback for the element of the entry that takes keyboard focus (the
	 * one with `onClick`); put it on that element as `ref`
	 *
	 * When the focused entry is removed (the definition changed after a
	 * navigation, or `shouldRender` turned false), MenuBase moves focus to the
	 * highlighted entry through it. Optional for a renderer: without it, focus
	 * goes to the first focusable element of the menu instead. Always passed by
	 * MenuBase.
	 */
	focusRef?: React.RefCallback<HTMLElement>;
}

/**
 * The menu item definition
 */
export interface IMenuItemDefinition {
	/**
	 * The icon of the menu item
	 */
	icon?: SvgIconComponent | React.ComponentType<Omit<SvgIconProps, "ref">>;
	/**
	 * The text of the menu item
	 */
	title: string;
	/**
	 * The click handler of the menu item
	 */
	onClick: React.MouseEventHandler;
	/**
	 * Middle-click handler
	 *
	 * Called with the `auxclick` event when the entry is clicked with the middle
	 * button (`button === 1`), not for the right, back or forward button. Does not
	 * change the active entry. In RoutedMenu it runs before the entry's `route`
	 * opens in a new tab.
	 */
	onAuxClick?: React.MouseEventHandler;
	/**
	 * Should this menu item be rendered? Useful for permission checks
	 */
	shouldRender: boolean;
	/**
	 * Should this entry forcibly expand? Used by RoutedMenu to auto-expand
	 */
	forceExpand?: boolean;
	/**
	 * The children of this menu entry
	 */
	children?: IMenuItemDefinition[];
}

export type MenuItemComponent = React.ComponentType<MenuItemProps>;

/**
 * The menu properties
 */
export interface MenuProps {
	/**
	 * The definition of the menu items
	 */
	definition: IMenuItemDefinition[];
	/**
	 * The wrapper element wrapping the menu items
	 */
	wrapper: React.ElementType<IMenuWrapperProps>;
	/**
	 * The menu item renderer component
	 */
	menuItem: MenuItemComponent;
	/**
	 * The class name to assign to the div wrapping the Wrapper
	 */
	className?: string;
	/**
	 * The class name to assign to the collapse wrapping the children of menu items
	 */
	childWrapperClassName?: string;
	/**
	 * Custom state which can be used to control the active menu entry
	 * Contains a string concatenated from menu item depth (zero based) and the menu item title
	 */
	customState?: [string, Dispatch<SetStateAction<string>>];
	/**
	 * Custom styles
	 */
	classes?: Partial<Record<PortalMenuClassKey, string>>;
}

// tabindex -1: focus goes here when the focused entry is removed and the menu
// has no focusable element left
const Root = styled("div", { name: "CcPortalMenu", slot: "root" })({
	height: "100%",
	width: "100%",
	overflow: "auto",
});

export type PortalMenuClassKey = "root";
export type PortalMenuProps = MenuProps; // alias

/**
 * A menu tree rendered with the given wrapper and entry renderer. A click on an
 * entry highlights it (a group expands or collapses instead).
 *
 * Keyboard focus stays in the menu when the focused entry is removed (the
 * definition changed, e.g. after a navigation, or `shouldRender` turned false):
 * it moves to the highlighted entry, or, if that cannot take focus, to the first
 * focusable element of the menu. Focus that is elsewhere is left alone.
 */
const PortalMenu = (inProps: MenuProps) => {
	const props = useThemeProps({ props: inProps, name: "CcPortalMenu" });
	const {
		wrapper: Wrapper,
		className,
		classes,
		customState,
		definition,
	} = props;
	const state = useState("");
	const menuState = customState || state;
	const [entries] = useState(() => new Map<string, HTMLElement>());
	const rootRef = useRef<HTMLDivElement>(null);
	const { onFocus, onBlur } = useMenuFocusRestore(
		rootRef,
		entries,
		menuState[0],
	);

	return (
		<Root
			ref={rootRef}
			className={combineClassNames([className, classes?.root])}
			tabIndex={-1}
			onFocus={onFocus}
			onBlur={onBlur}
		>
			<Wrapper>
				<MenuEntryElementsContext.Provider value={entries}>
					<MenuContext.Provider value={menuState}>
						{definition.map((child) =>
							toMenuItemComponent(props, child, 0, null),
						)}
					</MenuContext.Provider>
				</MenuEntryElementsContext.Provider>
			</Wrapper>
		</Root>
	);
};

export default React.memo(PortalMenu);
