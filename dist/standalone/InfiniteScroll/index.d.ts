import React, { PureComponent } from "react";
/**
 * The props of InfiniteScroll. Every prop of a `div` that is not listed here
 * (`role`, `aria-label`, `aria-labelledby`, `id`, `style`, event handlers, …)
 * is passed to the scroll container.
 */
export interface InfiniteScrollProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * The children to render, must not change their size though internal state updates.
     * Should update if loadMoreTop or loadMoreBottom is called.
     * This means the component which manages state needs to be a parent of the infinite scroll component
     */
    children: React.ReactNode;
    /**
     * The CSS class to apply, must bound the container's height (`height`,
     * `max-height`, or `flex: 1` inside a flex column of bounded height) and
     * set `overflow: auto`. Without a bounded height the content never
     * overflows, so `loadMoreBottom` is called again after every page until
     * it stops changing `children`.
     */
    className: string;
    /**
     * Loads more items above the current ones. Leave it `undefined` to disable
     * loading on top, and set it to `undefined` once there is nothing more
     * above; otherwise it is called again each time the container is at its
     * top.
     *
     * Called while the container is scrolled to its top (an offset less than
     * 1px counts as the top):
     * - once the content first fills the container: after mount, after the
     *   list became short again (e.g. it was emptied), after the container was
     *   hidden, and when `loadMoreTop` is passed after mount. So a list opens
     *   at its first row with a page already loaded above it;
     * - when a scroll event finds the container at its top;
     * - to fill a short list that has no `loadMoreBottom` (see there).
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
     * is over, the content still does not fill the container or the container
     * is still at its top; it is not made while the container is hidden. The
     * return value is ignored.
     */
    loadMoreTop?: () => void;
    /**
     * Loads more items below the current ones. Leave it `undefined` to disable
     * loading at the bottom, e.g. for a list that only grows upwards (a chat
     * history) or once there is nothing more below.
     *
     * Called when the container is scrolled to the bottom. An offset less than
     * 1px from the bottom counts as the bottom, because browsers can report a
     * fractional `scrollTop` there, e.g. inside an ancestor with CSS `zoom`.
     *
     * Also fills the container: after mount and after every render with new
     * `children`, it is called while the content does not overflow the
     * container by more than 24px. Without `loadMoreBottom` the container is
     * filled through `loadMoreTop` instead.
     *
     * A call that waits for `callBackDebounce` is only made if, once the wait is
     * over, the content still does not fill the container or the container is
     * still scrolled to the bottom.
     *
     * Not called while the container is hidden by `display: none` on it or an
     * ancestor (e.g. an inactive tab that stays mounted): the container is
     * filled once it is shown.
     */
    loadMoreBottom?: () => void;
    /**
     * Debounce wait in milliseconds for `loadMoreTop` and `loadMoreBottom`: a
     * burst of triggers results in one call, made `callBackDebounce` ms after
     * the last trigger. `0` calls the callbacks synchronously. Can be changed
     * after mount.
     *
     * A call is made with the callback of the latest render: a callback that is
     * replaced or removed while a call waits is not called. A call that still
     * waits when the component unmounts is not made.
     * @default 100
     */
    callBackDebounce?: number;
    /**
     * Dynamic size mode (enables resize listener)
     */
    dynamicallySized?: boolean;
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
}
/**
 * An element in the scroll container and its distance from the container's
 * visible top edge, in the container's CSS pixels, taken before rows are
 * added above it
 */
interface ScrollAnchor {
    element: Element;
    offset: number;
}
/**
 * Provides infinite scrolling to whatever is inside it. The scroll container
 * is a tab stop (see `tabIndex`) and takes the props of a `div`, such as a
 * role and an accessible name.
 */
declare class InfiniteScroll extends PureComponent<InfiniteScrollProps> {
    wrapper: HTMLElement | null;
    resizeObserver: ResizeObserver | null;
    /**
     * Timer of the pending debounced call per callback, 0 while none is pending
     */
    private loadTimers;
    /**
     * Did the last fill check find the scroll container without a layout box?
     * Its size is observed until it gets one, and the fill check runs again then.
     */
    private awaitingLayoutBox;
    /**
     * Is the scroll container's size observed (by `resizeObserver`, or through
     * `window` resize events without ResizeObserver)?
     */
    private observingSize;
    /**
     * The anchor that keeps the rows in view in place after rows were added
     * above them while the container was at its top. It is held until the
     * container is scrolled to another offset (by the user, the consumer or
     * the browser's own scroll anchoring), because the rows above can still
     * change their height after they were added, e.g. a placeholder that is
     * replaced by its data.
     */
    private heldAnchor;
    /**
     * The `scrollTop` that holding the anchor left; any other offset means
     * the container was scrolled since, which releases the anchor
     */
    private heldScrollTop;
    /**
     * Observes the size of the container's children while an anchor is held;
     * created when an anchor is first held
     */
    private contentObserver;
    /**
     * Is `loadMoreTop` due once the content fills the container? Set at
     * mount, while the content does not fill the container, while the
     * container is hidden and when `loadMoreTop` is passed; cleared by the
     * fill check that finds the container filled. A container that is at its
     * top fires no scroll event when the user scrolls up, so this is how a
     * list that is at its top gets the rows above it.
     */
    private topLoadDue;
    constructor(props: InfiniteScrollProps);
    componentDidMount(): void;
    /**
     * Takes the anchor that keeps the rows in view in place when `children`
     * change while the container is at its top and loading on top is enabled:
     * browsers' scroll anchoring does not apply to a container at its top.
     */
    getSnapshotBeforeUpdate(prevProps: Readonly<InfiniteScrollProps>): ScrollAnchor | null;
    componentDidUpdate(prevProps: Readonly<InfiniteScrollProps>, _prevState: unknown, anchor: ScrollAnchor | null): void;
    componentWillUnmount(): void;
    render(): React.ReactElement;
    setScrollerRef: (ref: HTMLElement | null) => void;
    /**
     * Starts or stops observing the scroll container's size; every change runs
     * the fill check again. Without ResizeObserver, `window` resize events are
     * listened to instead.
     * @param observe Observe? By default while `dynamicallySized` is set or
     * the fill waits for a layout box.
     */
    private observeSize;
    /**
     * Pauses the fill while the scroll container has no layout box: no
     * `loadMoreBottom` call is made, and the container is observed until it
     * gets a box, which runs the fill check again. Without ResizeObserver
     * nothing would notice the container being shown, so the fill is not
     * paused there.
     * @returns Whether the fill is paused
     */
    private pauseFillWhileHidden;
    /**
     * Observes the size of the container's current children, so that the
     * held anchor is kept in place when one of them changes its height
     */
    private observeContent;
    /**
     * Scrolls the container by as much as the held anchor moved, so the rows
     * in view stay where they were. Releases the anchor instead once the
     * container was scrolled to another offset, the anchor left the document
     * or the container lost its layout box.
     */
    private holdAnchor;
    /**
     * Stops holding the anchor
     */
    private releaseAnchor;
    /**
     * Requests `loadMoreTop` if it is due (see `topLoadDue`) and the
     * container is at its top. Called once the content fills the container.
     */
    private loadTopIfDue;
    /**
     * Requests a call of the `loadMoreTop` or `loadMoreBottom` prop: debounced by
     * `callBackDebounce` (a request replaces the pending one), or right away for 0
     */
    private requestLoad;
    /**
     * Drops the call of the `loadMoreTop` or `loadMoreBottom` prop that waits
     * for `callBackDebounce`, if any
     */
    private cancelLoad;
    /**
     * Makes a call requested by `requestLoad`. The callback is read from the
     * props now, so it is the one of the latest render. A call is only made if
     * the content still needs it: a request made while the content was short,
     * or while the container was at that end, is dropped once content that
     * arrived in the meantime fills the container and moves that end away, and
     * one is not made while the container is hidden (`pauseFillWhileHidden`).
     * A fill call that is dropped because the content now fills the container
     * (rows that grew on their own) lets the due `loadMoreTop` follow.
     */
    private callLoad;
    /**
     * The fill check, run after mount, after every render with new `children`
     * or a callback that was added or removed, and on size changes that are
     * observed: requests a fill call (`loadMoreBottom`, or `loadMoreTop`
     * without it) while the content does not fill the container, and the due
     * `loadMoreTop` once it does.
     */
    handleResize: () => void;
    handleScroll: () => void;
}
export default InfiniteScroll;
