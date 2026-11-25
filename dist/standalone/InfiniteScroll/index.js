import { jsx as _jsx } from "react/jsx-runtime";
import { PureComponent } from "react";
import { styled } from "@mui/material";
/**
 * Does the content overflow the scroll container by more than 24px? Until it
 * does, the container is filled through `loadMoreBottom`, or `loadMoreTop`
 * without it.
 */
const isFilled = (wrapper) => wrapper.scrollHeight > wrapper.clientHeight + 24;
/**
 * Is the scroll container scrolled to the bottom? `scrollTop` can be
 * fractional (e.g. inside an ancestor with CSS `zoom`) while `scrollHeight`
 * and `clientHeight` are rounded to whole pixels, so at the bottom it can be a
 * fraction of a pixel short of their difference or past it. An offset less
 * than 1px short of the difference, or past it, counts as the bottom.
 */
const isAtBottom = (wrapper) => wrapper.scrollHeight - wrapper.clientHeight - wrapper.scrollTop < 1;
/**
 * Is the scroll container scrolled to its top? An offset less than 1px counts,
 * like at the bottom (iOS reports negative offsets while it bounces at the
 * top).
 */
const isAtTop = (wrapper) => wrapper.scrollTop < 1;
/**
 * Has the scroll container been scrolled away from `scrollTop`? Browsers snap
 * a fractional offset that was set to device pixels, so a difference of less
 * than 1px is not a scroll.
 */
const isScrolledFrom = (wrapper, scrollTop) => Math.abs(wrapper.scrollTop - scrollTop) >= 1;
/**
 * The visible part of the scroll container (inside its border), in viewport
 * coordinates, and its vertical scale: an ancestor's transform, such as the
 * scale of a Popover's Grow transition while it opens, shrinks what
 * `getBoundingClientRect` reports but not `scrollTop`
 */
const getView = (wrapper) => {
    const box = wrapper.getBoundingClientRect();
    const scale = wrapper.offsetHeight > 0 && box.height > 0
        ? box.height / wrapper.offsetHeight
        : 1;
    const top = box.top + wrapper.clientTop * scale;
    return { top, bottom: top + wrapper.clientHeight * scale, scale };
};
/**
 * The distance of an element's top edge from the scroll container's visible
 * top edge, in the container's CSS pixels
 */
const getOffsetInView = (wrapper, element) => {
    const view = getView(wrapper);
    return (element.getBoundingClientRect().top - view.top) / view.scale;
};
/**
 * Picks the element to keep in place while rows are added above it, the way
 * CSS scroll anchoring does: the first element, in document order, that lies
 * entirely in the visible part of the container. A partly visible element is
 * searched for such an element first and is used itself if it contains none.
 * An element that is 0px high or has no box (`display: none` or `contents`)
 * is only searched.
 * @param parent The element whose children are searched
 * @param viewTop The container's visible top edge (viewport coordinates)
 * @param viewBottom The container's visible bottom edge
 */
const findAnchorElement = (parent, viewTop, viewBottom) => {
    for (const child of Array.from(parent.children)) {
        const rect = child.getBoundingClientRect();
        if (rect.height === 0) {
            const inner = findAnchorElement(child, viewTop, viewBottom);
            if (inner)
                return inner;
            continue;
        }
        if (rect.bottom <= viewTop || rect.top >= viewBottom)
            continue;
        if (rect.top >= viewTop && rect.bottom <= viewBottom)
            return child;
        return findAnchorElement(child, viewTop, viewBottom) ?? child;
    }
    return null;
};
/**
 * Has the scroll container no layout box, because it or an ancestor is
 * `display: none` (e.g. an inactive tab that stays mounted)? All its sizes
 * are 0 then, so the fill check cannot tell whether content is missing. A
 * container that has a box but is 0px high, such as an empty one bounded by
 * `max-height`, is not affected.
 */
const hasNoLayoutBox = (wrapper) => wrapper.clientHeight === 0 && wrapper.getClientRects().length === 0;
/**
 * The scroll container. It is a tab stop, so it shows the library's focus
 * ring while it has keyboard focus, drawn inside its edge because an
 * ancestor may clip it.
 */
const ScrollContainer = styled("div")(({ theme }) => ({
    "&:focus-visible": {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: -2,
    },
}));
/**
 * Provides infinite scrolling to whatever is inside it. The scroll container
 * is a tab stop (see `tabIndex`) and takes the props of a `div`, such as a
 * role and an accessible name.
 */
class InfiniteScroll extends PureComponent {
    wrapper = null;
    resizeObserver;
    /**
     * Timer of the pending debounced call per callback, 0 while none is pending
     */
    loadTimers = {
        loadMoreTop: 0,
        loadMoreBottom: 0,
    };
    /**
     * Did the last fill check find the scroll container without a layout box?
     * Its size is observed until it gets one, and the fill check runs again then.
     */
    awaitingLayoutBox = false;
    /**
     * Is the scroll container's size observed (by `resizeObserver`, or through
     * `window` resize events without ResizeObserver)?
     */
    observingSize = false;
    /**
     * The anchor that keeps the rows in view in place after rows were added
     * above them while the container was at its top. It is held until the
     * container is scrolled to another offset (by the user, the consumer or
     * the browser's own scroll anchoring), because the rows above can still
     * change their height after they were added, e.g. a placeholder that is
     * replaced by its data.
     */
    heldAnchor = null;
    /**
     * The `scrollTop` that holding the anchor left; any other offset means
     * the container was scrolled since, which releases the anchor
     */
    heldScrollTop = 0;
    /**
     * Observes the size of the container's children while an anchor is held;
     * created when an anchor is first held
     */
    contentObserver = null;
    /**
     * Is `loadMoreTop` due once the content fills the container? Set at
     * mount, while the content does not fill the container, while the
     * container is hidden and when `loadMoreTop` is passed; cleared by the
     * fill check that finds the container filled. A container that is at its
     * top fires no scroll event when the user scrolls up, so this is how a
     * list that is at its top gets the rows above it.
     */
    topLoadDue = true;
    constructor(props) {
        super(props);
        this.resizeObserver = window.ResizeObserver
            ? new ResizeObserver(this.handleResize)
            : null;
    }
    componentDidMount() {
        if (!this.wrapper)
            throw new Error("Ref is null");
        // StrictMode mounts the same instance again after unmounting it
        this.topLoadDue = true;
        this.wrapper.addEventListener("scroll", this.handleScroll);
        this.handleResize();
        this.observeSize();
    }
    /**
     * Takes the anchor that keeps the rows in view in place when `children`
     * change while the container is at its top and loading on top is enabled:
     * browsers' scroll anchoring does not apply to a container at its top.
     */
    getSnapshotBeforeUpdate(prevProps) {
        const wrapper = this.wrapper;
        if (!wrapper ||
            this.heldAnchor ||
            prevProps.children === this.props.children ||
            !(prevProps.loadMoreTop || this.props.loadMoreTop) ||
            !isAtTop(wrapper)) {
            return null;
        }
        const view = getView(wrapper);
        const element = findAnchorElement(wrapper, view.top, view.bottom);
        if (!element)
            return null;
        this.heldScrollTop = wrapper.scrollTop;
        return { element, offset: getOffsetInView(wrapper, element) };
    }
    componentDidUpdate(prevProps, _prevState, anchor) {
        if (anchor)
            this.heldAnchor = anchor;
        if (this.heldAnchor) {
            if (anchor || prevProps.children !== this.props.children) {
                this.observeContent();
            }
            this.holdAnchor();
        }
        if (!prevProps.loadMoreTop && this.props.loadMoreTop) {
            this.topLoadDue = true;
        }
        if (prevProps.children !== this.props.children ||
            !prevProps.loadMoreTop !== !this.props.loadMoreTop ||
            !prevProps.loadMoreBottom !== !this.props.loadMoreBottom) {
            this.handleResize();
        }
        if (!!prevProps.dynamicallySized !== !!this.props.dynamicallySized) {
            this.observeSize();
        }
    }
    componentWillUnmount() {
        this.cancelLoad("loadMoreTop");
        this.cancelLoad("loadMoreBottom");
        this.releaseAnchor();
        if (!this.wrapper)
            throw new Error("Ref is null");
        this.wrapper.removeEventListener("scroll", this.handleScroll);
        this.observeSize(false);
    }
    render() {
        const { children, 
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        loadMoreTop, 
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        loadMoreBottom, 
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        callBackDebounce, 
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        dynamicallySized, tabIndex, ...containerProps } = this.props;
        return (_jsx(ScrollContainer, { ...containerProps, tabIndex: tabIndex ?? 0, ref: this.setScrollerRef, children: children }));
    }
    setScrollerRef = (ref) => {
        this.wrapper = ref;
    };
    /**
     * Starts or stops observing the scroll container's size; every change runs
     * the fill check again. Without ResizeObserver, `window` resize events are
     * listened to instead.
     * @param observe Observe? By default while `dynamicallySized` is set or
     * the fill waits for a layout box.
     */
    observeSize = (observe = !!this.props.dynamicallySized || this.awaitingLayoutBox) => {
        if (!this.wrapper || observe === this.observingSize)
            return;
        this.observingSize = observe;
        if (this.resizeObserver) {
            if (observe)
                this.resizeObserver.observe(this.wrapper);
            else
                this.resizeObserver.unobserve(this.wrapper);
        }
        else if (observe) {
            window.addEventListener("resize", this.handleResize);
        }
        else {
            window.removeEventListener("resize", this.handleResize);
        }
    };
    /**
     * Pauses the fill while the scroll container has no layout box: no
     * `loadMoreBottom` call is made, and the container is observed until it
     * gets a box, which runs the fill check again. Without ResizeObserver
     * nothing would notice the container being shown, so the fill is not
     * paused there.
     * @returns Whether the fill is paused
     */
    pauseFillWhileHidden = () => {
        if (!this.wrapper || !this.resizeObserver)
            return false;
        this.awaitingLayoutBox = hasNoLayoutBox(this.wrapper);
        this.observeSize();
        if (this.awaitingLayoutBox) {
            // a container that is shown again starts at its top
            this.topLoadDue = true;
            this.releaseAnchor();
        }
        return this.awaitingLayoutBox;
    };
    /**
     * Observes the size of the container's current children, so that the
     * held anchor is kept in place when one of them changes its height
     */
    observeContent = () => {
        if (!this.wrapper || !window.ResizeObserver)
            return;
        if (!this.contentObserver) {
            this.contentObserver = new ResizeObserver(this.holdAnchor);
        }
        this.contentObserver.disconnect();
        for (const child of Array.from(this.wrapper.children)) {
            this.contentObserver.observe(child);
        }
    };
    /**
     * Scrolls the container by as much as the held anchor moved, so the rows
     * in view stay where they were. Releases the anchor instead once the
     * container was scrolled to another offset, the anchor left the document
     * or the container lost its layout box.
     */
    holdAnchor = () => {
        const wrapper = this.wrapper;
        const anchor = this.heldAnchor;
        if (!wrapper || !anchor)
            return;
        if (isScrolledFrom(wrapper, this.heldScrollTop) ||
            !anchor.element.isConnected ||
            hasNoLayoutBox(wrapper)) {
            this.releaseAnchor();
            return;
        }
        const moved = getOffsetInView(wrapper, anchor.element) - anchor.offset;
        if (moved !== 0)
            wrapper.scrollTop += moved;
        this.heldScrollTop = wrapper.scrollTop;
    };
    /**
     * Stops holding the anchor
     */
    releaseAnchor = () => {
        this.heldAnchor = null;
        this.contentObserver?.disconnect();
    };
    /**
     * Requests `loadMoreTop` if it is due (see `topLoadDue`) and the
     * container is at its top. Called once the content fills the container.
     */
    loadTopIfDue = () => {
        if (!this.wrapper || !this.topLoadDue)
            return;
        this.topLoadDue = false;
        if (this.props.loadMoreTop && isAtTop(this.wrapper)) {
            this.requestLoad("loadMoreTop");
        }
    };
    /**
     * Requests a call of the `loadMoreTop` or `loadMoreBottom` prop: debounced by
     * `callBackDebounce` (a request replaces the pending one), or right away for 0
     */
    requestLoad = (name) => {
        this.cancelLoad(name);
        const wait = this.props.callBackDebounce ?? 100;
        if (wait === 0) {
            this.callLoad(name);
            return;
        }
        this.loadTimers[name] = window.setTimeout(() => {
            this.loadTimers[name] = 0;
            this.callLoad(name);
        }, wait);
    };
    /**
     * Drops the call of the `loadMoreTop` or `loadMoreBottom` prop that waits
     * for `callBackDebounce`, if any
     */
    cancelLoad = (name) => {
        window.clearTimeout(this.loadTimers[name]);
        this.loadTimers[name] = 0;
    };
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
    callLoad = (name) => {
        if (!this.wrapper || this.pauseFillWhileHidden())
            return;
        const atEnd = name === "loadMoreTop" ? isAtTop(this.wrapper) : isAtBottom(this.wrapper);
        if (isFilled(this.wrapper) && !atEnd) {
            this.loadTopIfDue();
            return;
        }
        const load = this.props[name];
        if (load)
            load();
    };
    /**
     * The fill check, run after mount, after every render with new `children`
     * or a callback that was added or removed, and on size changes that are
     * observed: requests a fill call (`loadMoreBottom`, or `loadMoreTop`
     * without it) while the content does not fill the container, and the due
     * `loadMoreTop` once it does.
     */
    handleResize = () => {
        if (!this.wrapper || this.pauseFillWhileHidden())
            return;
        if (isFilled(this.wrapper)) {
            this.loadTopIfDue();
            return;
        }
        this.topLoadDue = true;
        if (this.props.loadMoreBottom)
            this.requestLoad("loadMoreBottom");
        else if (this.props.loadMoreTop)
            this.requestLoad("loadMoreTop");
    };
    handleScroll = () => {
        if (!this.wrapper)
            return;
        if (this.heldAnchor && isScrolledFrom(this.wrapper, this.heldScrollTop)) {
            this.releaseAnchor();
        }
        if (this.props.loadMoreTop && isAtTop(this.wrapper)) {
            this.requestLoad("loadMoreTop");
        }
        if (this.props.loadMoreBottom && isAtBottom(this.wrapper)) {
            this.requestLoad("loadMoreBottom");
        }
    };
}
export default InfiniteScroll;
