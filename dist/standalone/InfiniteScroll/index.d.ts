import React, { PureComponent } from "react";
export interface InfiniteScrollProps {
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
     * Callback to load more elements on top. Optional, do not specify to disable up-scrolling
     */
    loadMoreTop?: () => void;
    /**
     * Callback to load more elements at the bottom.
     *
     * A call that waits for `callBackDebounce` is only made if, once the wait is
     * over, the content still does not fill the container or the container is
     * still scrolled to the bottom.
     *
     * Not called while the container is hidden by `display: none` on it or an
     * ancestor (e.g. an inactive tab that stays mounted): the container is
     * filled once it is shown.
     */
    loadMoreBottom: () => void;
    /**
     * Debounce wait in milliseconds for `loadMoreTop` and `loadMoreBottom`: a
     * burst of triggers results in one call, made `callBackDebounce` ms after
     * the last trigger. `0` calls the callbacks synchronously. Can be changed
     * after mount.
     *
     * A call is made with the callback of the latest render: a callback that is
     * replaced or removed while a call waits is not called.
     * @default 100
     */
    callBackDebounce?: number;
    /**
     * Dynamic size mode (enables resize listener)
     */
    dynamicallySized?: boolean;
}
interface IState {
    /**
     * Initial scroll set? Used for infinite up-scrolling
     */
    initScroll: boolean;
}
/**
 * Provides infinite scrolling to whatever is inside it
 */
declare class InfiniteScroll extends PureComponent<InfiniteScrollProps, IState> {
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
    constructor(props: InfiniteScrollProps);
    componentDidMount(): void;
    componentDidUpdate(prevProps: Readonly<InfiniteScrollProps>): void;
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
     * Requests a call of the `loadMoreTop` or `loadMoreBottom` prop: debounced by
     * `callBackDebounce` (a request replaces the pending one), or right away for 0
     */
    private requestLoad;
    /**
     * Makes a call requested by `requestLoad`. The callback is read from the
     * props now, so it is the one of the latest render. `loadMoreBottom` is only
     * called if the content still needs it: a request made while the content was
     * short, or while the container was at the bottom, is dropped once content
     * that arrived in the meantime fills the container and moves the bottom away,
     * and one is not made while the container is hidden (`pauseFillWhileHidden`).
     */
    private callLoad;
    handleResize: () => void;
    handleScroll: () => void;
}
export default InfiniteScroll;
