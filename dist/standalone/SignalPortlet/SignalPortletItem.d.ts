import React from "react";
import { TypographyProps } from "@mui/material";
export interface SignalPortletItemProps {
    /**
     * The number to show. `null` or `undefined` shows a spinner (loading),
     * 0 the grey "inactive" avatar, any other number the primary "active"
     * avatar. A count above 999 shows as "999+" in a smaller font, and
     * assistive technology gets the full number instead (screen readers read
     * `count: 1500, text: "Devices"` as "1500 Devices").
     *
     * Pass a non-negative integer: negative numbers, NaN and fractions are
     * shown as given ("-3" and "2.5" in the active avatar, "NaN" in the inactive
     * one). `count: data?.x` therefore spins until `data` arrives, and also
     * forever if the field is missing from the loaded data.
     */
    count: number | null | undefined;
    /**
     * The text of the portlet item
     */
    text: React.ReactNode;
    /**
     * Typography props
     */
    textTypographyProps?: TypographyProps;
    /**
     * The url the portlet item links to onClick
     */
    link?: string;
    /**
     * Class name for the row's `<li>` (the `root` slot), with or without
     * link. This is also the element that SignalPortlet's `classes.item` and
     * its theme slot `item` style.
     */
    className?: string;
    /**
     * Custom CSS styles
     */
    classes?: Partial<Record<SignalPortletItemClassKey, string>>;
}
/**
 * Slots of a SignalPortlet row, for an item's `classes` and for the theme's
 * `components.CcSignalPortletItem.styleOverrides`:
 * - `root`: the ListItem (`<li>`) of every row. A row with link has no
 *   padding here (MUI's `disablePadding`), its ListItemButton has it.
 * - `rootBtn`: the ListItemButton (a `div` with role button) inside the
 *   `<li>` of a row with link
 * - `listAvatar`: the ListItemAvatar around the count
 * - `itemColorLoading`, `itemColorActive`, `itemColorInactive`: the 40px
 *   Avatar while the count is `null` or `undefined`, when it is non-zero, and
 *   when it is 0
 * - `countCapped`: the visible "999+" of a count above 999, hidden from
 *   assistive technology
 * - `countFull`: the visually hidden full number of a count above 999, read
 *   by assistive technology
 * - `listText`: the ListItemText
 */
export type SignalPortletItemClassKey = "listAvatar" | "itemColorLoading" | "itemColorActive" | "itemColorInactive" | "countCapped" | "countFull" | "listText" | "root" | "rootBtn";
declare const _default: React.MemoExoticComponent<(inProps: SignalPortletItemProps) => React.JSX.Element>;
export default _default;
