import React, { useMemo } from "react";
import { Menu, menuItemClasses, styled, useTheme, } from "@mui/material";
const PopupMenuRoot = styled(Menu, { name: "CcPopupMenu", slot: "root" })(({ theme }) => ({
    "& .MuiMenu-paper": {
        border: `1px solid ${theme.palette.divider}`,
    },
    // MUI marks the keyboard-focused item with a faint tint only, which forced colors
    // drop; inset, because the paper clips the item's sides
    [`& .${menuItemClasses.root}.${menuItemClasses.focusVisible}`]: {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: -2,
    },
}));
const isEnabledItem = (item) => !item.hasAttribute("disabled") &&
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
const focusInitialItem = (container, preferSelected) => {
    const focused = container.ownerDocument.activeElement;
    // with autoFocus={false} or disableAutoFocusItem, MUI focuses no item
    if (!(focused instanceof HTMLElement) ||
        !container.contains(focused) ||
        !focused.classList.contains(menuItemClasses.root))
        return;
    const items = Array.from(container.querySelectorAll(`.${menuItemClasses.root}`)).filter(isEnabledItem);
    const initial = (preferSelected &&
        items.find((item) => item.classList.contains(menuItemClasses.selected))) ||
        items[0];
    if (initial && initial !== focused)
        initial.focus();
};
/**
 * A MUI `Menu` with a 1px `theme.palette.divider` border around its paper. It
 * takes all `MenuProps`. Every open starts where MUI starts a menu's first
 * open: on the selected item with the default variant `selectedMenu`, else on
 * the first enabled item. This also holds with `keepMounted`, whose items keep
 * their state between opens.
 */
const PopupMenu = React.forwardRef(function PopupMenu(props, ref) {
    const { slotProps, variant } = props;
    const theme = useTheme();
    const preferSelected = (variant ??
        theme.components?.MuiMenu?.defaultProps?.variant ??
        "selectedMenu") === "selectedMenu";
    const transition = slotProps?.transition;
    // runs after MUI's own initial focus (Menu calls the slot's onEntering after it)
    const transitionWithInitialFocus = useMemo(() => {
        const withInitialFocus = (transitionProps) => ({
            ...transitionProps,
            onEntering: (node, isAppearing) => {
                focusInitialItem(node, preferSelected);
                transitionProps?.onEntering?.(node, isAppearing);
            },
        });
        return typeof transition === "function"
            ? (ownerState) => withInitialFocus(transition(ownerState))
            : withInitialFocus(transition);
    }, [transition, preferSelected]);
    const menuSlotProps = useMemo(() => ({ ...slotProps, transition: transitionWithInitialFocus }), [slotProps, transitionWithInitialFocus]);
    return React.createElement(PopupMenuRoot, {
        ...props,
        ref,
        slotProps: menuSlotProps,
    });
});
export default React.memo(PopupMenu);
