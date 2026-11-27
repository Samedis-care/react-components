import React from "react";
import { SignalPortletItemProps } from "./SignalPortletItem";
export interface SignalPortletProps {
    /**
     * The title of the portlet
     */
    title: React.ReactNode;
    /**
     * The portlet items, one row each, in order. An item's `className` is
     * added to `classes.item`, which every row gets.
     */
    items: SignalPortletItemProps[];
    /**
     * When the shown data was produced, as a Date or in milliseconds since the
     * epoch (e.g. `Date.now()`). Shows "Last refresh: <age>" in the footer, with
     * the date and time in a tooltip. The age advances while the card stays
     * mounted.
     *
     * `null`, `undefined`, an invalid time (`NaN`, `new Date("garbage")`) and 0
     * (the epoch, also as `new Date(0)`, which is what `new Date(null)` gives)
     * hide the label. So react-query's `dataUpdatedAt`, 0 until the first
     * successful fetch, can be passed as it is.
     */
    updatedAt?: number | Date | null | undefined;
    /**
     * Shows a refresh icon button (named "Refresh") at the end of the footer,
     * and is called without arguments on every click or keyboard activation of
     * it. So a function whose parameters are optional, such as react-query's
     * `refetch`, can be passed as it is. Omit it to hide the button.
     */
    onRefresh?: () => void;
    /**
     * Class names per slot, see {@link SignalPortletClassKey}. Each one is
     * added to its slot's element, next to the slot's theme `styleOverrides`.
     */
    classes?: Partial<Record<SignalPortletClassKey, string>>;
    /**
     * Class name to apply to root
     */
    className?: string;
}
/**
 * Slots of SignalPortlet, for its `classes` and for the theme's
 * `components.CcSignalPortlet.styleOverrides`:
 * - `root`: the outer `div`, which also gets `className`
 * - `paper`: the MUI Paper in it
 * - `innerContainer`: the column Grid container in the Paper, with the title,
 *   divider and list at the top and the footer at the bottom
 * - `titleWrapper`: the Grid item around the title
 * - `title`: the title Typography (`<h5>`)
 * - `divider`: the Grid item around the MUI Divider
 * - `list`: the MUI List (`<ul>`)
 * - `item`: the `<li>` of every row, the element of CcSignalPortletItem's
 *   `root` slot
 * - `lastUpdatedAt`: the `span` with the "Last refresh" text, shown while
 *   `updatedAt` holds a time
 * - `refreshIconButton`: the Refresh IconButton, shown with `onRefresh`
 * - `refreshIcon`: the refresh icon (`svg`) in that button
 */
export type SignalPortletClassKey = "root" | "paper" | "divider" | "titleWrapper" | "title" | "list" | "item" | "refreshIconButton" | "refreshIcon" | "lastUpdatedAt" | "innerContainer";
declare const _default: React.MemoExoticComponent<(inProps: SignalPortletProps) => React.JSX.Element>;
export default _default;
