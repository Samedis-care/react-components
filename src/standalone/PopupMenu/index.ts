import React, { useMemo } from "react";
import {
	Menu,
	menuItemClasses,
	MenuProps,
	styled,
	useTheme,
} from "@mui/material";

export type PopupMenuClassKey = "root";
const PopupMenuRoot = styled(Menu, { name: "CcPopupMenu", slot: "root" })(
	({ theme }) => ({
		"& .MuiMenu-paper": {
			border: `1px solid ${theme.palette.divider}`,
		},
		// MUI marks the keyboard-focused item with a faint tint only, which forced colors
		// drop; inset, because the paper clips the item's sides
		[`& .${menuItemClasses.root}.${menuItemClasses.focusVisible}`]: {
			outline: `2px solid ${theme.palette.primary.main}`,
			outlineOffset: -2,
		},
	}),
) as typeof Menu;

type TransitionSlotProps = NonNullable<MenuProps["slotProps"]>["transition"];
type TransitionOnEntering = (node: HTMLElement, isAppearing: boolean) => void;

const isEnabledItem = (item: HTMLElement) =>
	!item.hasAttribute("disabled") &&
	item.getAttribute("aria-disabled") !== "true";

/**
 * Moves focus to the item a menu opens on, the selected one (if preferred) or
 * else the first enabled one, when MUI has put focus on another of its items.
 * MUI's MenuList remembers the item that had focus for as long as it stays
 * mounted, so a keepMounted menu reopened on the item that had focus when it
 * closed.
 * @param container The menu's paper (the transition's node)
 * @param preferSelected Start on the selected item, as variant "selectedMenu"
 * does
 */
const focusInitialItem = (container: HTMLElement, preferSelected: boolean) => {
	const focused = container.ownerDocument.activeElement;
	// with autoFocus={false} or disableAutoFocusItem, MUI focuses no item
	if (
		!(focused instanceof HTMLElement) ||
		!container.contains(focused) ||
		!focused.classList.contains(menuItemClasses.root)
	)
		return;
	const items = Array.from(
		container.querySelectorAll<HTMLElement>(`.${menuItemClasses.root}`),
	).filter(isEnabledItem);
	const initial =
		(preferSelected &&
			items.find((item) =>
				item.classList.contains(menuItemClasses.selected),
			)) ||
		items[0];
	if (initial && initial !== focused) initial.focus();
};

/**
 * Props of {@link PopupMenu}: MUI's `MenuProps`, with a different default for
 * `elevation`.
 */
export interface PopupMenuProps extends MenuProps {
	/**
	 * The shadow depth of the menu paper, an index into `theme.shadows`. The
	 * border outlines the menu, so by default it has no shadow; a value above 0
	 * draws MUI's shadow of that depth in addition to the border.
	 * @default 0
	 */
	elevation?: MenuProps["elevation"];
}

/**
 * A MUI `Menu` with a 1px `theme.palette.divider` border around its paper. It
 * takes all `MenuProps`. It is flat: `elevation` defaults to 0, so the border
 * is its only outline. Placement and mounting are `Menu`'s defaults: it opens
 * below its anchor, aligned at the anchor's start edge (`anchorOrigin`,
 * `transformOrigin`), and its items leave the page while it is closed
 * (`keepMounted`). Every open starts where MUI starts a menu's first
 * open: on the selected item with the default variant `selectedMenu`, else on
 * the first enabled item. This also holds with `keepMounted`, whose items keep
 * their state between opens.
 */
const PopupMenu = React.forwardRef(function PopupMenu(
	props: PopupMenuProps,
	ref: React.ForwardedRef<HTMLDivElement>,
) {
	const { slotProps, variant, elevation = 0 } = props;
	const theme = useTheme();
	const preferSelected =
		(variant ??
			theme.components?.MuiMenu?.defaultProps?.variant ??
			"selectedMenu") === "selectedMenu";
	const transition = slotProps?.transition;
	// runs after MUI's own initial focus (Menu calls the slot's onEntering after it)
	const transitionWithInitialFocus = useMemo((): TransitionSlotProps => {
		const withInitialFocus = <T extends { onEntering?: TransitionOnEntering }>(
			transitionProps: T | undefined,
		) => ({
			...transitionProps,
			onEntering: (node: HTMLElement, isAppearing: boolean) => {
				focusInitialItem(node, preferSelected);
				transitionProps?.onEntering?.(node, isAppearing);
			},
		});
		return typeof transition === "function"
			? (ownerState) => withInitialFocus(transition(ownerState))
			: withInitialFocus(transition);
	}, [transition, preferSelected]);
	const menuSlotProps = useMemo(
		() => ({ ...slotProps, transition: transitionWithInitialFocus }),
		[slotProps, transitionWithInitialFocus],
	);

	return React.createElement(PopupMenuRoot, {
		...props,
		elevation,
		ref,
		slotProps: menuSlotProps,
	});
});

export default React.memo(PopupMenu) as unknown as (
	props: PopupMenuProps,
) => React.JSX.Element;
