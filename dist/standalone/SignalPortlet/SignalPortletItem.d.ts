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
     * The label next to the count. With the count it names the row; in a row
     * with `link` it is part of the link, so it must not contain interactive
     * content (links, buttons, inputs), which a link cannot hold.
     */
    text: React.ReactNode;
    /**
     * Typography props
     */
    textTypographyProps?: TypographyProps;
    /**
     * Where the row links to: a path of the app, with an optional `?query` and
     * `#hash`, as the `to` of the library's `Link`, which needs a
     * HistoryRouter above it. The row is then a link, an `<a>` with this
     * href, named by its count and text: a click or Enter navigates in the
     * app. A click with Ctrl, Meta, Shift or Alt and a middle click are left
     * to the browser, which opens the href in a new tab or window, as for any
     * other link. A URL with a scheme ("https://…") makes a plain link that
     * the browser follows.
     * Default: none (no link, also for an empty string): the row is a plain,
     * non-interactive list item.
     */
    link?: string;
    /**
     * Class name for the row's `<li>` (the `root` slot), with or without
     * link. This is also the element that SignalPortlet's `classes.item` and
     * its theme slot `item` style.
     */
    className?: string;
    /**
     * Class names per slot, see {@link SignalPortletItemClassKey}. Each one is
     * added to its slot's element while the row renders it: `root`,
     * `listAvatar` and `listText` always, one of `itemColorLoading`,
     * `itemColorActive` and `itemColorInactive` for the current count,
     * `countCapped` and `countFull` for a count above 999, and `rootBtn` in a
     * row with `link`.
     */
    classes?: Partial<Record<SignalPortletItemClassKey, string>>;
}
/**
 * Slots of a SignalPortlet row, for an item's `classes` and for the theme's
 * `components.CcSignalPortletItem.styleOverrides`:
 * - `root`: the ListItem (`<li>`) of every row. A row with link has no
 *   padding here (MUI's `disablePadding`), its ListItemButton has it.
 * - `rootBtn`: the ListItemButton inside the `<li>` of a row with link,
 *   rendered as the link itself: an `<a>` with the link's href. Keyboard
 *   focus draws a 2px outline in `palette.primary.main` inside its edges,
 *   or the ring of the theme's `focusVisible` option when the theme sets
 *   one.
 * - `listAvatar`: the ListItemAvatar around the count
 * - `itemColorLoading`, `itemColorActive`, `itemColorInactive`: the 40px
 *   Avatar while the count is `null` or `undefined`, when it is non-zero, and
 *   when it is 0. The active one is `palette.primary.main` with its
 *   `contrastText`. The inactive one is `palette.grey[400]`, `grey[600]` in a
 *   dark palette or the dark scheme of a theme of CSS variables, with
 *   `palette.getContrastText` of that grey as its text color; a `color` and
 *   `backgroundColor` set for it in the theme apply in every scheme
 * - `countCapped`: the visible "999+" of a count above 999, hidden from
 *   assistive technology
 * - `countFull`: the visually hidden full number of a count above 999, read
 *   by assistive technology
 * - `listText`: the ListItemText
 */
export type SignalPortletItemClassKey = "listAvatar" | "itemColorLoading" | "itemColorActive" | "itemColorInactive" | "countCapped" | "countFull" | "listText" | "root" | "rootBtn";
declare const _default: React.MemoExoticComponent<(inProps: SignalPortletItemProps) => React.JSX.Element>;
export default _default;
