import React, { PureComponent } from "react";
export interface InfiniteScrollProps {
    /**
     * The children to render, must not change their size though internal state updates.
     * Should update if loadMoreTop or loadMoreBottom is called.
     * This means the component which manages state needs to be a parent of the infinite scroll component
     */
    children: React.ReactNode;
    /**
     * The CSS class to apply, must set a height value and overflow: auto
     */
    className: string;
    /**
     * Callback to load more elements on top. Optional, do not specify to disable up-scrolling
     */
    loadMoreTop?: () => void;
    /**
     * Callback to load more elements at the bottom.
     */
    loadMoreBottom: () => void;
    /**
     * Debounce wait in milliseconds for `loadMoreTop` and `loadMoreBottom`: a
     * burst of triggers results in one call, made `callBackDebounce` ms after
     * the last trigger. `0` calls the callbacks synchronously. Can be changed
     * after mount.
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
    /**
     * Debounced version of IProps.loadMoreTop
     */
    loadMoreTop?: () => void;
    /**
     * Debounced version of IProps.loadMoreBottom
     */
    loadMoreBottom: () => void;
}
/**
 * Provides infinite scrolling to whatever is inside it
 */
declare class InfiniteScroll extends PureComponent<InfiniteScrollProps, IState> {
    wrapper: HTMLElement | null;
    resizeObserver: ResizeObserver | null;
    constructor(props: InfiniteScrollProps);
    componentDidMount(): void;
    componentDidUpdate(prevProps: Readonly<InfiniteScrollProps>): void;
    componentWillUnmount(): void;
    render(): React.ReactElement;
    setScrollerRef: (ref: HTMLElement | null) => void;
    handleResize: () => void;
    handleScroll: () => void;
}
export default InfiniteScroll;
