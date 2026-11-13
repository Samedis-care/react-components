import { jsx as _jsx } from "react/jsx-runtime";
import { PureComponent } from "react";
import { styled } from "@mui/material";
/**
 * Does the content overflow the scroll container by more than 24px? Until it
 * does, the container is filled through `loadMoreBottom`.
 */
const isFilled = (wrapper) => wrapper.scrollHeight > wrapper.clientHeight + 24;
/**
 * Is the scroll container scrolled to the bottom?
 */
const isAtBottom = (wrapper) => wrapper.scrollTop === wrapper.scrollHeight - wrapper.clientHeight;
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
    constructor(props) {
        super(props);
        this.resizeObserver = window.ResizeObserver
            ? new ResizeObserver(this.handleResize)
            : null;
        this.state = {
            initScroll: !this.props.loadMoreTop, // we don't need to set an initial scroll if we don't need up-scrolling
        };
    }
    componentDidMount() {
        if (!this.wrapper)
            throw new Error("Ref is null");
        this.wrapper.addEventListener("scroll", this.handleScroll);
        this.handleResize();
        this.observeSize();
    }
    componentDidUpdate(prevProps) {
        if (prevProps.children !== this.props.children) {
            this.handleResize();
        }
        if (!!prevProps.dynamicallySized !== !!this.props.dynamicallySized) {
            this.observeSize();
        }
    }
    componentWillUnmount() {
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
        return this.awaitingLayoutBox;
    };
    /**
     * Requests a call of the `loadMoreTop` or `loadMoreBottom` prop: debounced by
     * `callBackDebounce` (a request replaces the pending one), or right away for 0
     */
    requestLoad = (name) => {
        window.clearTimeout(this.loadTimers[name]);
        this.loadTimers[name] = 0;
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
     * Makes a call requested by `requestLoad`. The callback is read from the
     * props now, so it is the one of the latest render. `loadMoreBottom` is only
     * called if the content still needs it: a request made while the content was
     * short, or while the container was at the bottom, is dropped once content
     * that arrived in the meantime fills the container and moves the bottom away,
     * and one is not made while the container is hidden (`pauseFillWhileHidden`).
     */
    callLoad = (name) => {
        if (name === "loadMoreTop") {
            const loadMoreTop = this.props.loadMoreTop;
            if (loadMoreTop)
                loadMoreTop();
            return;
        }
        if (!this.wrapper || this.pauseFillWhileHidden())
            return;
        if (isFilled(this.wrapper) && !isAtBottom(this.wrapper))
            return;
        const loadMoreBottom = this.props.loadMoreBottom;
        loadMoreBottom();
    };
    handleResize = () => {
        if (!this.wrapper || this.pauseFillWhileHidden())
            return;
        if (isFilled(this.wrapper)) {
            if (!this.state.initScroll) {
                this.wrapper.scrollTop = 24;
                this.setState({
                    initScroll: true,
                });
            }
        }
        else {
            this.requestLoad("loadMoreBottom");
        }
    };
    handleScroll = () => {
        if (!this.wrapper)
            return;
        if (this.wrapper.scrollTop === 0 && this.props.loadMoreTop) {
            this.wrapper.scrollTop = 1;
            this.requestLoad("loadMoreTop");
        }
        else if (isAtBottom(this.wrapper)) {
            this.requestLoad("loadMoreBottom");
        }
    };
}
export default InfiniteScroll;
