import React, { PureComponent } from "react";
import { styled } from "@mui/material";

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

interface IState {
	/**
	 * Initial scroll set? Used for infinite up-scrolling
	 */
	initScroll: boolean;
}

/**
 * The load callbacks, by prop name
 */
type LoadCallbackName = "loadMoreTop" | "loadMoreBottom";

/**
 * Does the content overflow the scroll container by more than 24px? Until it
 * does, the container is filled through `loadMoreBottom`.
 */
const isFilled = (wrapper: HTMLElement): boolean =>
	wrapper.scrollHeight > wrapper.clientHeight + 24;

/**
 * Is the scroll container scrolled to the bottom?
 */
const isAtBottom = (wrapper: HTMLElement): boolean =>
	wrapper.scrollTop === wrapper.scrollHeight - wrapper.clientHeight;

/**
 * Has the scroll container no layout box, because it or an ancestor is
 * `display: none` (e.g. an inactive tab that stays mounted)? All its sizes
 * are 0 then, so the fill check cannot tell whether content is missing. A
 * container that has a box but is 0px high, such as an empty one bounded by
 * `max-height`, is not affected.
 */
const hasNoLayoutBox = (wrapper: HTMLElement): boolean =>
	wrapper.clientHeight === 0 && wrapper.getClientRects().length === 0;

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
class InfiniteScroll extends PureComponent<InfiniteScrollProps, IState> {
	public wrapper: HTMLElement | null = null;
	public resizeObserver: ResizeObserver | null;
	/**
	 * Timer of the pending debounced call per callback, 0 while none is pending
	 */
	private loadTimers: Record<LoadCallbackName, number> = {
		loadMoreTop: 0,
		loadMoreBottom: 0,
	};
	/**
	 * Did the last fill check find the scroll container without a layout box?
	 * Its size is observed until it gets one, and the fill check runs again then.
	 */
	private awaitingLayoutBox = false;
	/**
	 * Is the scroll container's size observed (by `resizeObserver`, or through
	 * `window` resize events without ResizeObserver)?
	 */
	private observingSize = false;

	constructor(props: InfiniteScrollProps) {
		super(props);

		this.resizeObserver = window.ResizeObserver
			? new ResizeObserver(this.handleResize)
			: null;
		this.state = {
			initScroll: !this.props.loadMoreTop, // we don't need to set an initial scroll if we don't need up-scrolling
		};
	}

	componentDidMount(): void {
		if (!this.wrapper) throw new Error("Ref is null");

		this.wrapper.addEventListener("scroll", this.handleScroll);
		this.handleResize();
		this.observeSize();
	}

	componentDidUpdate(prevProps: Readonly<InfiniteScrollProps>): void {
		if (prevProps.children !== this.props.children) {
			this.handleResize();
		}
		if (!!prevProps.dynamicallySized !== !!this.props.dynamicallySized) {
			this.observeSize();
		}
	}

	componentWillUnmount(): void {
		if (!this.wrapper) throw new Error("Ref is null");
		this.wrapper.removeEventListener("scroll", this.handleScroll);
		this.observeSize(false);
	}

	render(): React.ReactElement {
		const {
			children,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			loadMoreTop,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			loadMoreBottom,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			callBackDebounce,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			dynamicallySized,
			tabIndex,
			...containerProps
		} = this.props;
		return (
			<ScrollContainer
				{...containerProps}
				tabIndex={tabIndex ?? 0}
				ref={this.setScrollerRef}
			>
				{children}
			</ScrollContainer>
		);
	}

	setScrollerRef = (ref: HTMLElement | null): void => {
		this.wrapper = ref;
	};

	/**
	 * Starts or stops observing the scroll container's size; every change runs
	 * the fill check again. Without ResizeObserver, `window` resize events are
	 * listened to instead.
	 * @param observe Observe? By default while `dynamicallySized` is set or
	 * the fill waits for a layout box.
	 */
	private observeSize = (
		observe = !!this.props.dynamicallySized || this.awaitingLayoutBox,
	): void => {
		if (!this.wrapper || observe === this.observingSize) return;
		this.observingSize = observe;
		if (this.resizeObserver) {
			if (observe) this.resizeObserver.observe(this.wrapper);
			else this.resizeObserver.unobserve(this.wrapper);
		} else if (observe) {
			window.addEventListener("resize", this.handleResize);
		} else {
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
	private pauseFillWhileHidden = (): boolean => {
		if (!this.wrapper || !this.resizeObserver) return false;
		this.awaitingLayoutBox = hasNoLayoutBox(this.wrapper);
		this.observeSize();
		return this.awaitingLayoutBox;
	};

	/**
	 * Requests a call of the `loadMoreTop` or `loadMoreBottom` prop: debounced by
	 * `callBackDebounce` (a request replaces the pending one), or right away for 0
	 */
	private requestLoad = (name: LoadCallbackName): void => {
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
	private callLoad = (name: LoadCallbackName): void => {
		if (name === "loadMoreTop") {
			const loadMoreTop = this.props.loadMoreTop;
			if (loadMoreTop) loadMoreTop();
			return;
		}
		if (!this.wrapper || this.pauseFillWhileHidden()) return;
		if (isFilled(this.wrapper) && !isAtBottom(this.wrapper)) return;
		const loadMoreBottom = this.props.loadMoreBottom;
		loadMoreBottom();
	};

	handleResize = (): void => {
		if (!this.wrapper || this.pauseFillWhileHidden()) return;

		if (isFilled(this.wrapper)) {
			if (!this.state.initScroll) {
				this.wrapper.scrollTop = 24;
				this.setState({
					initScroll: true,
				});
			}
		} else {
			this.requestLoad("loadMoreBottom");
		}
	};

	handleScroll = (): void => {
		if (!this.wrapper) return;

		if (this.wrapper.scrollTop === 0 && this.props.loadMoreTop) {
			this.wrapper.scrollTop = 1;
			this.requestLoad("loadMoreTop");
		} else if (isAtBottom(this.wrapper)) {
			this.requestLoad("loadMoreBottom");
		}
	};
}

export default InfiniteScroll;
