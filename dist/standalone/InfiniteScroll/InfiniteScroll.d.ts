import React from "react";
import { SxProps, Theme } from "@mui/material";
/**
 * The props of InfiniteScroll, also the type of the theme's
 * `components.CcInfiniteScroll.defaultProps`. Every prop of a `div` that is
 * not listed here (`role`, `aria-label`, `aria-labelledby`, `id`, `style`,
 * event handlers, …) is passed to the scroll container.
 */
export interface InfiniteScrollProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * The children to render, must not change their size though internal state updates.
     * Should update if loadMoreTop or loadMoreBottom is called.
     * This means the component which manages state needs to be a parent of the infinite scroll component
     */
    children: React.ReactNode;
    /**
     * CSS class names for the scroll container. The styles of an emotion
     * class, such as the one `styled(InfiniteScroll)` passes, come after the
     * container's `root` styles and the theme's, so they win over them. One
     * way to give the container the bounded height it needs (see the
     * component).
     */
    className?: string;
    /**
     * Loads more items above the current ones. Leave it `undefined` to disable
     * loading on top, and set it to `undefined` once there is nothing more
     * above; otherwise it is called again each time the container is at its
     * top.
     *
     * Called while the container is scrolled to its top (an offset less than
     * 1px counts as the top), whatever the `threshold`:
     * - once the content first fills the container (overflows it by more than
     *   `threshold`): after mount, after the list became short again (e.g. it
     *   was emptied, or its container grew), after the container was hidden,
     *   and when `loadMoreTop` is passed after mount. So a list opens at its
     *   first row with a page already loaded above it;
     * - when a scroll event finds the container at its top;
     * - to fill a short list that has no `loadMoreBottom` (see there).
     *
     * It is also called when focus moves to the first row the keyboard reaches
     * in the container, however far the container is from its top: an element
     * before which the container has no tab stop, e.g. the first row's button
     * after a heading or empty days. So the next Shift+Tab reaches the new rows
     * instead of leaving the list. In a widget that moves focus with the arrow
     * keys (a menu, listbox or grid whose items have a negative `tabIndex`),
     * that is its first item: an element before the focused one with the same
     * tag and `role` counts like a tab stop. Focus on the scroll container
     * itself does not count.
     *
     * Prepend the new items to `children`. While the container is at its top,
     * the component keeps the rows in view where they are, so the new items
     * are added out of view above them and the user scrolls up into them;
     * it keeps doing so while the new items still change their height (e.g. a
     * placeholder replaced by its data), until the list is scrolled. Elsewhere
     * the browser's scroll anchoring does the same (do not set
     * `overflow-anchor: none` on the container). The list is never scrolled
     * down to make loading on top possible: its first row and its first pixel
     * stay reachable.
     *
     * A call that waits for `callBackDebounce` is only made if, once the wait
     * is over, the content still does not fill the container, the container
     * is still at its top, or focus is still on that first row; it is not made
     * while the container is hidden, and waits while `loading` is set.
     *
     * The return value is ignored: a promise it returns is not awaited, so an
     * async callback handles its own errors. Pass `loading` while the load
     * runs.
     */
    loadMoreTop?: () => void;
    /**
     * Loads more items below the current ones. Leave it `undefined` to disable
     * loading at the bottom, e.g. for a list that only grows upwards (a chat
     * history) or once there is nothing more below.
     *
     * Called while `threshold` px (250px by default) or less of content are
     * left below the visible part of the container, so the next items are
     * usually there before the user reaches the end. A distance less than 1px
     * more counts too, because browsers can report a fractional `scrollTop`,
     * e.g. inside an ancestor with CSS `zoom`. This is checked:
     * - when the container is scrolled;
     * - after mount, after every render with new `children`, and whenever the
     *   container's size changes (e.g. a height relative to the viewport on a
     *   window resize). This also fills the container: a list whose content
     *   does not overflow it by more than `threshold` is extended until it
     *   does. Without `loadMoreBottom` the container is filled through
     *   `loadMoreTop` instead.
     *
     * It is also called when focus moves to the last row the keyboard reaches
     * in the container, however much is left below the visible part: an
     * element after which the container has no tab stop, e.g. the last row's
     * button followed by a loader row, a footer or empty days. So the next
     * Tab reaches the new rows instead of leaving the list. In a widget that
     * moves focus with the arrow keys (a menu, listbox or grid whose items
     * have a negative `tabIndex`), that is its last item: an element after
     * the focused one with the same tag and `role` counts like a tab stop.
     * Focus on the scroll container itself does not count.
     *
     * A call that waits for `callBackDebounce` is only made if, once the wait is
     * over, `threshold` px or less are still left below the visible part, or
     * focus is still on that last row; it waits while `loading` is set.
     *
     * Not called while the container is hidden by `display: none` on it or an
     * ancestor (e.g. an inactive tab that stays mounted): the container is
     * filled once it is shown.
     *
     * The return value is ignored: a promise it returns is not awaited, so an
     * async callback handles its own errors. Pass `loading` while the load
     * runs.
     */
    loadMoreBottom?: () => void;
    /**
     * Is a load running? Set it to `true` in the update that starts loading
     * (in `loadMoreTop` or `loadMoreBottom`, or when the list is loaded or
     * started over by other means, e.g. after a filter change), and to `false`
     * in the update that adds the loaded items, or when the load fails or its
     * result is discarded.
     *
     * While it is `true`:
     * - neither `loadMoreTop` nor `loadMoreBottom` is called, so the callbacks
     *   need no guard of their own against a second call. A call that comes
     *   up meanwhile (a scroll to an end, new `children` that leave the list
     *   short, e.g. a list emptied for a new filter) is made once `loading`
     *   turns `false`, if the content still needs it then;
     * - the scroll container is marked `aria-busy`, unless `aria-busy` is
     *   passed.
     *
     * A load that ends without new items while no call came up is not
     * repeated, so a request that fails does not loop. Offer a retry (e.g. a
     * button that loads again), and set the callback to `undefined` once there
     * is nothing more to load.
     *
     * Nothing is announced: render the loading and end-of-list status
     * yourself, as text in a polite live region (`role="status"`) outside the
     * container.
     * @default false
     */
    loading?: boolean;
    /**
     * How much content is kept ready below the visible part of the container,
     * in CSS pixels: `loadMoreBottom` is called while this much or less is
     * left below it, and the container is filled until its content overflows
     * it by more than this. `0` loads at the very bottom only (or when focus
     * reaches the last row, see `loadMoreBottom`). A negative number or `NaN`
     * counts as `0`. Can be changed after mount.
     *
     * `loadMoreTop` is called at the top (or when focus reaches the first row,
     * see `loadMoreTop`), whatever this value.
     * @default 250
     */
    threshold?: number;
    /**
     * The wait in milliseconds before `loadMoreTop` or `loadMoreBottom` is
     * called: a trigger (a scroll near that end, the fill check after new
     * `children` or a size change, focus on the last row) starts the wait, and
     * the triggers that come while it runs join it without restarting it. So
     * the call is made `callBackDebounce` ms after the first trigger, also
     * while the user keeps scrolling: a steady scroll into the last `threshold`
     * px gets its call before it reaches the bottom.
     * While the triggers go on, e.g. a scroll that stays near the bottom while
     * the page loads, the first trigger after the call starts the next wait, so
     * the callback is called again every `callBackDebounce` ms: pass `loading`
     * while a load runs, so that no call is made until it ends.
     *
     * `0` calls the callbacks synchronously. A negative number or `NaN` counts
     * as `0`. A wait longer than 2147483647 ms (2^31 - 1, about 24.8 days, the
     * longest delay a timer supports), `Infinity` included, never ends: while
     * it is set, no call is made, as while `loading` is set, and the calls that
     * come up meanwhile are made once it changes to a shorter wait, after that
     * wait, if the content still needs them then.
     * Can be changed after mount; it applies to the waits that start after the
     * change, and with `0` the next trigger calls at once.
     *
     * A call is made with the callback of the latest render: a callback that is
     * replaced or removed while a call waits is not called. A call that still
     * waits when the component unmounts is not made.
     * @default 100
     */
    callBackDebounce?: number;
    /**
     * The scroll container's `tabIndex`. By default it is a tab stop, so
     * keyboard users can scroll it (and so load more) even when the rows
     * contain nothing focusable, and a click on a row keeps focus in the list,
     * where the arrow keys, Page Up/Down, Home and End scroll it. `-1` takes it
     * out of the tab order but keeps focus in the list on click.
     *
     * A tab stop needs a name: give the container a role and an accessible
     * name, e.g. `role="region"` with `aria-labelledby` pointing at the
     * list's visible heading, or `aria-label`.
     * @default 0
     */
    tabIndex?: number;
    /**
     * System styles for the scroll container, as on MUI components
     */
    sx?: SxProps<Theme>;
}
/**
 * Theme style slots of InfiniteScroll
 * (`components.CcInfiniteScroll.styleOverrides.<slot>`): `root` is the
 * scroll container.
 */
export type InfiniteScrollClassKey = "root";
declare const _default: React.NamedExoticComponent<InfiniteScrollProps & React.RefAttributes<HTMLDivElement>>;
export default _default;
