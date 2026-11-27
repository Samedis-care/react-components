import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useLayoutEffect, useRef } from "react";
import { styled, useThemeProps } from "@mui/material";
import { useForkRef } from "@mui/material/utils";
import ScrollContent from "./ScrollContent";
const LOAD_CALLBACK_NAMES = [
    "loadMoreTop",
    "loadMoreBottom",
];
/**
 * The default `threshold`, in CSS pixels
 */
const DEFAULT_THRESHOLD = 250;
/**
 * The default `callBackDebounce`, in milliseconds
 */
const DEFAULT_CALLBACK_DEBOUNCE = 100;
/**
 * The longest delay a timer supports, in milliseconds (2^31 - 1, about 24.8
 * days). Browsers convert a delay to a 32-bit integer, so they run a longer
 * one, `Infinity` included, after a few ms or after a wrapped-around delay.
 */
const MAX_TIMER_DELAY = 2 ** 31 - 1;
/**
 * Does the content overflow the scroll container by more than `threshold`?
 * Until it does, the container is filled through `loadMoreBottom`, or
 * `loadMoreTop` without it.
 */
const isFilled = (wrapper, threshold) => wrapper.scrollHeight > wrapper.clientHeight + threshold;
/**
 * Are `threshold` px or less of content left below the visible part of the
 * scroll container? `scrollTop` can be fractional (e.g. inside an ancestor
 * with CSS `zoom`) while `scrollHeight` and `clientHeight` are rounded to
 * whole pixels, so at the bottom it can be a fraction of a pixel short of
 * their difference or past it. A distance less than 1px more than `threshold`
 * counts too, so with `threshold` 0 a container less than 1px from the bottom
 * is at the bottom.
 */
const isNearBottom = (wrapper, threshold) => wrapper.scrollHeight - wrapper.clientHeight - wrapper.scrollTop <
    threshold + 1;
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
 * The elements that can take focus: those MUI's focus trap looks for, and
 * the `summary` of a `details`
 */
const FOCUSABLE_SELECTOR = [
    "input",
    "select",
    "textarea",
    "a[href]",
    "button",
    "summary",
    "[tabindex]",
    "audio[controls]",
    "video[controls]",
    '[contenteditable]:not([contenteditable="false"])',
].join(",");
/**
 * The element's tab index, as MUI's focus trap reads it: that of its
 * `tabindex` attribute, else the browser's (Chromium reports -1 for media and
 * editable elements, which Tab reaches)
 */
const getTabIndex = (element) => {
    const attribute = parseInt(element.getAttribute("tabindex") ?? "", 10);
    if (!Number.isNaN(attribute))
        return attribute;
    if (element.isContentEditable || element instanceof HTMLMediaElement) {
        return 0;
    }
    return element.tabIndex;
};
/**
 * Can the element take focus? Not when it is disabled (also by a disabled
 * `fieldset`), a hidden input, in a `[hidden]` or `[inert]` subtree, or not
 * rendered (`display: none`, `visibility: hidden`; not checked where
 * `checkVisibility` is missing, as in jsdom)
 */
const canTakeFocus = (element) => !element.matches(":disabled") &&
    !(element instanceof HTMLInputElement && element.type === "hidden") &&
    element.closest("[hidden], [inert]") === null &&
    (typeof element.checkVisibility !== "function" ||
        element.checkVisibility({ visibilityProperty: true }));
/**
 * Can the keyboard move focus from `focused` to `candidate`? Tab and
 * Shift+Tab reach a tab stop (an element that can take focus, with a tab
 * index of 0 or more); the arrow keys of a widget that moves focus itself (a
 * menu, listbox or grid whose items have a negative `tabIndex`) reach its
 * other items, elements with the same tag and `role` as `focused`.
 */
const isFocusTarget = (focused, candidate) => canTakeFocus(candidate) &&
    (getTabIndex(candidate) >= 0 ||
        (candidate.tagName === focused.tagName &&
            candidate.getAttribute("role") === focused.getAttribute("role")));
/**
 * Can the keyboard move focus from `focused` to an element after it in the
 * scroll container (see `isFocusTarget`)?
 */
const hasFocusTargetAfter = (wrapper, focused) => {
    const candidates = wrapper.querySelectorAll(FOCUSABLE_SELECTOR);
    // from the end, so that a long list is searched no further than its last
    // tab stop
    for (let i = candidates.length - 1; i >= 0; i--) {
        const candidate = candidates[i];
        if (!(focused.compareDocumentPosition(candidate) &
            Node.DOCUMENT_POSITION_FOLLOWING)) {
            return false;
        }
        if (isFocusTarget(focused, candidate))
            return true;
    }
    return false;
};
/**
 * Can the keyboard move focus from `focused` to an element before it in the
 * scroll container (see `isFocusTarget`)? An element that contains `focused`
 * comes before it, as Shift+Tab goes from an element to its container.
 */
const hasFocusTargetBefore = (wrapper, focused) => {
    const candidates = wrapper.querySelectorAll(FOCUSABLE_SELECTOR);
    // from the start, so that a long list is searched no further than its
    // first tab stop
    for (let i = 0; i < candidates.length; i++) {
        const candidate = candidates[i];
        if (!(focused.compareDocumentPosition(candidate) &
            Node.DOCUMENT_POSITION_PRECEDING)) {
            return false;
        }
        if (isFocusTarget(focused, candidate))
            return true;
    }
    return false;
};
/**
 * The element in the scroll container that has focus; `null` while focus is
 * on the container itself or outside it
 */
const getFocusedRow = (wrapper) => {
    const focused = wrapper.ownerDocument.activeElement;
    return focused && focused !== wrapper && wrapper.contains(focused)
        ? focused
        : null;
};
/**
 * Is focus on the last row the keyboard reaches in the scroll container: on
 * an element in it (not the container itself) after which it has nothing the
 * keyboard can move focus to (see `hasFocusTargetAfter`)? The next Tab leaves
 * the list then.
 */
const isFocusOnLastRow = (wrapper) => {
    const focused = getFocusedRow(wrapper);
    return !!focused && !hasFocusTargetAfter(wrapper, focused);
};
/**
 * Is focus on the first row the keyboard reaches in the scroll container: on
 * an element in it (not the container itself) before which it has nothing
 * the keyboard can move focus to (see `hasFocusTargetBefore`)? The next
 * Shift+Tab leaves the rows then.
 */
const isFocusOnFirstRow = (wrapper) => {
    const focused = getFocusedRow(wrapper);
    return !!focused && !hasFocusTargetBefore(wrapper, focused);
};
/**
 * The state of an InfiniteScroll that has not been mounted yet
 * @param props The props of its first render
 */
const createScrollState = (props) => ({
    wrapper: null,
    props,
    sizeObserver: null,
    loadTimers: { loadMoreTop: 0, loadMoreBottom: 0 },
    heldAnchor: null,
    heldScrollTop: 0,
    contentObserver: null,
    takenAnchor: null,
    topLoadDue: true,
    heldLoads: { loadMoreTop: false, loadMoreBottom: false },
});
/**
 * The `threshold` prop, with its default; a negative number or NaN counts
 * as 0
 */
const getThreshold = (props) => {
    const threshold = props.threshold ?? DEFAULT_THRESHOLD;
    return threshold > 0 ? threshold : 0;
};
/**
 * The `callBackDebounce` prop, with its default; a negative number or NaN
 * counts as 0, and `null` stands for a wait longer than `MAX_TIMER_DELAY`
 * (Infinity included), which never ends
 */
const getCallBackDebounce = (props) => {
    const wait = props.callBackDebounce ?? DEFAULT_CALLBACK_DEBOUNCE;
    if (wait > MAX_TIMER_DELAY)
        return null;
    return wait > 0 ? wait : 0;
};
/**
 * Are the calls of the load callbacks held: while `loading` is set, and while
 * the `callBackDebounce` wait never ends?
 */
const holdsLoads = (props) => !!props.loading || getCallBackDebounce(props) === null;
/**
 * Stops holding the anchor
 */
const releaseAnchor = (scroll) => {
    scroll.heldAnchor = null;
    scroll.contentObserver?.disconnect();
};
/**
 * Scrolls the container by as much as the held anchor moved, so the rows
 * in view stay where they were. Releases the anchor instead once the
 * container was scrolled to another offset, the anchor left the document
 * or the container lost its layout box.
 */
const holdAnchor = (scroll) => {
    const { wrapper, heldAnchor: anchor } = scroll;
    if (!wrapper || !anchor)
        return;
    if (isScrolledFrom(wrapper, scroll.heldScrollTop) ||
        !anchor.element.isConnected ||
        hasNoLayoutBox(wrapper)) {
        releaseAnchor(scroll);
        return;
    }
    const moved = getOffsetInView(wrapper, anchor.element) - anchor.offset;
    if (moved !== 0)
        wrapper.scrollTop += moved;
    scroll.heldScrollTop = wrapper.scrollTop;
};
/**
 * Observes the size of the container's current children, so that the
 * held anchor is kept in place when one of them changes its height
 */
const observeContent = (scroll) => {
    const { wrapper } = scroll;
    if (!wrapper || !window.ResizeObserver)
        return;
    if (!scroll.contentObserver) {
        scroll.contentObserver = new ResizeObserver(() => holdAnchor(scroll));
    }
    scroll.contentObserver.disconnect();
    for (const child of Array.from(wrapper.children)) {
        scroll.contentObserver.observe(child);
    }
};
/**
 * Takes the anchor that keeps the rows in view in place when a commit
 * changes `children` while the container is at its top and loading on top
 * is enabled: browsers' scroll anchoring does not apply to a container at
 * its top. Called in that commit before it changes the DOM (see
 * `ScrollContent`); the commit's `handleUpdate` holds it.
 */
const takeAnchor = (scroll) => {
    const { wrapper } = scroll;
    if (!wrapper || scroll.heldAnchor || !isAtTop(wrapper))
        return;
    const view = getView(wrapper);
    const element = findAnchorElement(wrapper, view.top, view.bottom);
    if (!element)
        return;
    scroll.heldScrollTop = wrapper.scrollTop;
    scroll.takenAnchor = { element, offset: getOffsetInView(wrapper, element) };
};
/**
 * Pauses the fill while the scroll container has no layout box: no
 * `loadMoreBottom` call is made until the container gets a box, a size
 * change that runs the fill check again (see `sizeObserver`). Without
 * ResizeObserver nothing would notice the container being shown, so the
 * fill is not paused there.
 * @returns Whether the fill is paused
 */
const pauseFillWhileHidden = (scroll) => {
    const { wrapper } = scroll;
    if (!wrapper || !scroll.sizeObserver)
        return false;
    if (!hasNoLayoutBox(wrapper))
        return false;
    // a container that is shown again starts at its top
    scroll.topLoadDue = true;
    releaseAnchor(scroll);
    return true;
};
/**
 * Drops the call of the `loadMoreTop` or `loadMoreBottom` prop that waits
 * for `callBackDebounce`, if any
 */
const cancelLoad = (scroll, name) => {
    window.clearTimeout(scroll.loadTimers[name]);
    scroll.loadTimers[name] = 0;
};
/**
 * Requests a call of the `loadMoreTop` or `loadMoreBottom` prop:
 * `callBackDebounce` ms from now, or right away for 0 (see
 * `getCallBackDebounce`); it is held while that wait never ends (see
 * `holdsLoads`). A request made while a call waits joins it and does not
 * restart the wait, so triggers that keep coming (a steady scroll near an
 * end, new `children` one after another) do not postpone the call; the first
 * request after the call starts a new wait.
 */
const requestLoad = (scroll, name) => {
    const wait = getCallBackDebounce(scroll.props);
    if (wait === null) {
        scroll.heldLoads[name] = true;
        return;
    }
    if (wait === 0) {
        cancelLoad(scroll, name);
        callLoad(scroll, name);
        return;
    }
    if (scroll.loadTimers[name])
        return;
    scroll.loadTimers[name] = window.setTimeout(() => {
        scroll.loadTimers[name] = 0;
        callLoad(scroll, name);
    }, wait);
};
/**
 * Requests the held calls (see `holdsLoads`) again, now that they are no
 * longer held
 */
const requestHeldLoads = (scroll) => {
    for (const name of LOAD_CALLBACK_NAMES) {
        if (!scroll.heldLoads[name])
            continue;
        scroll.heldLoads[name] = false;
        requestLoad(scroll, name);
    }
};
/**
 * Requests `loadMoreTop` if it is due (see `topLoadDue`) and the
 * container is at its top. Called once the content fills the container.
 */
const loadTopIfDue = (scroll) => {
    if (!scroll.wrapper || !scroll.topLoadDue)
        return;
    scroll.topLoadDue = false;
    if (scroll.props.loadMoreTop && isAtTop(scroll.wrapper)) {
        requestLoad(scroll, "loadMoreTop");
    }
};
/**
 * Makes a call requested by `requestLoad`. The callback is read from the
 * props now, so it is the one of the latest commit. A call is only made if
 * the content still needs it: a request made while the content was short,
 * or while the container was near that end (or focus on its first or last
 * row), is dropped once content that arrived in the meantime fills the
 * container and moves that end away (or focus moved on), and one is not made
 * while the container is hidden (`pauseFillWhileHidden`).
 * While calls are held (see `holdsLoads`), the call is held and requested
 * again once they no longer are. A fill call that is dropped because the
 * content now fills the container (rows that grew on their own) lets the due
 * `loadMoreTop` follow.
 */
const callLoad = (scroll, name) => {
    const { wrapper } = scroll;
    if (!wrapper || pauseFillWhileHidden(scroll))
        return;
    if (holdsLoads(scroll.props)) {
        scroll.heldLoads[name] = true;
        return;
    }
    const threshold = getThreshold(scroll.props);
    const atEnd = name === "loadMoreTop"
        ? isAtTop(wrapper) || isFocusOnFirstRow(wrapper)
        : isNearBottom(wrapper, threshold) || isFocusOnLastRow(wrapper);
    if (isFilled(wrapper, threshold) && !atEnd) {
        loadTopIfDue(scroll);
        return;
    }
    const load = scroll.props[name];
    if (load)
        load();
};
/**
 * The fill check, run after mount, after every commit with new `children`,
 * a callback that was added or removed or a new `threshold`, and on every
 * change of the container's size: requests `loadMoreBottom` while
 * `threshold` px or less are left below the visible part (which includes
 * content that does not fill the container), or `loadMoreTop` without it
 * while the content does not fill the container, and the due `loadMoreTop`
 * once it does.
 */
const handleResize = (scroll) => {
    const { wrapper } = scroll;
    if (!wrapper || pauseFillWhileHidden(scroll))
        return;
    const threshold = getThreshold(scroll.props);
    const filled = isFilled(wrapper, threshold);
    if (!filled)
        scroll.topLoadDue = true;
    if (scroll.props.loadMoreBottom) {
        if (isNearBottom(wrapper, threshold)) {
            requestLoad(scroll, "loadMoreBottom");
        }
    }
    else if (!filled && scroll.props.loadMoreTop) {
        requestLoad(scroll, "loadMoreTop");
    }
    if (filled)
        loadTopIfDue(scroll);
};
/**
 * Requests `loadMoreTop` when focus moves to the first row the keyboard
 * reaches (see `isFocusOnFirstRow`), and `loadMoreBottom` when it moves to
 * the last one (see `isFocusOnLastRow`), so that the next Shift+Tab or Tab
 * reaches the new rows rather than leaving the list
 */
const handleFocusIn = (scroll) => {
    const { wrapper, props } = scroll;
    if (!wrapper)
        return;
    if (props.loadMoreTop && isFocusOnFirstRow(wrapper)) {
        requestLoad(scroll, "loadMoreTop");
    }
    if (props.loadMoreBottom && isFocusOnLastRow(wrapper)) {
        requestLoad(scroll, "loadMoreBottom");
    }
};
/**
 * Releases the held anchor once the container was scrolled away from it,
 * and requests `loadMoreTop` at the top and `loadMoreBottom` near the bottom
 */
const handleScroll = (scroll) => {
    const { wrapper } = scroll;
    if (!wrapper)
        return;
    if (scroll.heldAnchor && isScrolledFrom(wrapper, scroll.heldScrollTop)) {
        releaseAnchor(scroll);
    }
    if (scroll.props.loadMoreTop && isAtTop(wrapper)) {
        requestLoad(scroll, "loadMoreTop");
    }
    if (scroll.props.loadMoreBottom &&
        isNearBottom(wrapper, getThreshold(scroll.props))) {
        requestLoad(scroll, "loadMoreBottom");
    }
};
/**
 * Applies a commit after the first one, whose props are already in
 * `scroll.props`: holds the anchor taken before it changed the DOM (see
 * `takeAnchor`), keeps a held anchor in place, and runs the fill check and
 * the held calls where the new props need them
 * @param scroll The state
 * @param prevProps The props of the commit before
 */
const handleUpdate = (scroll, prevProps) => {
    const { props } = scroll;
    const childrenChanged = prevProps.children !== props.children;
    if (scroll.takenAnchor) {
        scroll.heldAnchor = scroll.takenAnchor;
        scroll.takenAnchor = null;
    }
    if (scroll.heldAnchor) {
        if (childrenChanged)
            observeContent(scroll);
        holdAnchor(scroll);
    }
    if (!prevProps.loadMoreTop && props.loadMoreTop) {
        scroll.topLoadDue = true;
    }
    if (childrenChanged ||
        !prevProps.loadMoreTop !== !props.loadMoreTop ||
        !prevProps.loadMoreBottom !== !props.loadMoreBottom ||
        !Object.is(prevProps.threshold, props.threshold)) {
        handleResize(scroll);
    }
    if (holdsLoads(prevProps) && !holdsLoads(props)) {
        requestHeldLoads(scroll);
    }
};
/**
 * The scroll container (the `root` slot). It scrolls its content. It is a tab
 * stop, so it shows the library's focus ring while it has keyboard focus,
 * drawn inside its edge because an ancestor may clip it.
 */
const InfiniteScrollRoot = styled("div", {
    name: "CcInfiniteScroll",
    slot: "root",
})(({ theme }) => ({
    overflow: "auto",
    "&:focus-visible": {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: -2,
    },
}));
/**
 * Provides infinite scrolling to whatever is inside it. The scroll container
 * is a tab stop (see `tabIndex`) and takes the props of a `div`, such as a
 * role and an accessible name.
 *
 * The scroll container scrolls (`overflow: auto`) and needs a bounded
 * height: `height`, `max-height`, or `flex: 1` inside a flex column of
 * bounded height, set through `className`, `styled(InfiniteScroll)`, `sx`,
 * `style` or the theme. Without one the content never overflows, so
 * `loadMoreBottom` is called again after every page until it stops changing
 * `children`. The height may change after mount without a render, e.g.
 * `50vh` on a window resize or device rotation: the container's size is
 * observed, and a container that grows past its content is filled again.
 *
 * Theme: `components.CcInfiniteScroll.defaultProps` (see
 * `InfiniteScrollProps`), `styleOverrides.root` (see
 * `InfiniteScrollClassKey`), and `variants`, which apply to the scroll
 * container and match the `div` props it gets after the theme's default
 * props: the ones passed, `tabIndex` and `aria-busy` (`true` while `loading`,
 * unless passed). InfiniteScroll's own props (`loading`, `threshold`, the
 * callbacks, …) do not reach it.
 *
 * It renders no loader, end-of-list or error row and announces nothing:
 * render those inside or around it, with the status as text in a polite live
 * region (`role="status"`) outside the container, and pass `loading` while a
 * load runs.
 *
 * A ref to it is the scroll container element, `null` before mount and after
 * unmount. Set its `scrollTop` to scroll the list programmatically, e.g. to
 * an item; a scroll to an end loads more, as a scroll by the user does.
 * Scrolling moves the view, not the focus: to move the keyboard there too,
 * focus the item.
 * @param inProps The props, see `InfiniteScrollProps`
 * @param ref The ref to the scroll container element
 */
const InfiniteScroll = React.forwardRef(function InfiniteScroll(inProps, ref) {
    // the listeners, observers and timers read these, the theme's default
    // props included
    const props = useThemeProps({ props: inProps, name: "CcInfiniteScroll" });
    const { children, loadMoreTop, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    loadMoreBottom, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    callBackDebounce, loading, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    threshold, tabIndex, ...containerProps } = props;
    const scrollRef = useRef(null);
    if (!scrollRef.current)
        scrollRef.current = createScrollState(props);
    const scroll = scrollRef.current;
    const setWrapper = useCallback((element) => {
        scroll.wrapper = element;
    }, [scroll]);
    const handleRef = useForkRef(ref, setWrapper);
    const handleBeforeChildrenChange = useCallback(() => takeAnchor(scroll), [scroll]);
    // mount and unmount
    useLayoutEffect(() => {
        const wrapper = scroll.wrapper;
        if (!wrapper)
            throw new Error("Ref is null");
        // StrictMode mounts the component again after unmounting it
        scroll.topLoadDue = true;
        scroll.heldLoads = { loadMoreTop: false, loadMoreBottom: false };
        const onScroll = () => handleScroll(scroll);
        const onFocusIn = () => handleFocusIn(scroll);
        // every change of the container's size runs the fill check again, so
        // a container that grows (a height relative to the viewport on a window
        // resize or device rotation, a resizable panel, a hidden container that
        // is shown) is filled
        const onResize = () => handleResize(scroll);
        const sizeObserver = window.ResizeObserver
            ? new ResizeObserver(onResize)
            : null;
        scroll.sizeObserver = sizeObserver;
        wrapper.addEventListener("scroll", onScroll);
        wrapper.addEventListener("focusin", onFocusIn);
        handleResize(scroll);
        if (sizeObserver)
            sizeObserver.observe(wrapper);
        else
            window.addEventListener("resize", onResize);
        return () => {
            cancelLoad(scroll, "loadMoreTop");
            cancelLoad(scroll, "loadMoreBottom");
            releaseAnchor(scroll);
            wrapper.removeEventListener("scroll", onScroll);
            wrapper.removeEventListener("focusin", onFocusIn);
            if (sizeObserver)
                sizeObserver.unobserve(wrapper);
            else
                window.removeEventListener("resize", onResize);
            scroll.sizeObserver = null;
        };
    }, [scroll]);
    // every commit, after the mount above (which reads the first props): the
    // props for the listeners, observers and timers, and what changed with them
    useLayoutEffect(() => {
        const prevProps = scroll.props;
        scroll.props = props;
        if (prevProps !== props)
            handleUpdate(scroll, prevProps);
    });
    return (_jsx(InfiniteScrollRoot, { ...containerProps, "aria-busy": containerProps["aria-busy"] ?? (loading || undefined), tabIndex: tabIndex ?? 0, ref: handleRef, children: _jsx(ScrollContent, { loadsOnTop: !!loadMoreTop, onBeforeChange: handleBeforeChildrenChange, children: children }) }));
});
export default React.memo(InfiniteScroll);
