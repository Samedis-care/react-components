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
	 *
	 * A call that waits for `callBackDebounce` is only made if, once the wait is
	 * over, the content still does not fill the container or the container is
	 * still scrolled to the bottom.
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
 * Provides infinite scrolling to whatever is inside it
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
		if (this.props.dynamicallySized) {
			if (this.resizeObserver) {
				this.resizeObserver.observe(this.wrapper);
			} else {
				window.addEventListener("resize", this.handleResize);
			}
		}
	}

	componentDidUpdate(prevProps: Readonly<InfiniteScrollProps>): void {
		if (prevProps.children !== this.props.children) {
			this.handleResize();
		}
		if (!!prevProps.dynamicallySized !== !!this.props.dynamicallySized) {
			if (!this.wrapper) return;
			if (prevProps.dynamicallySized) {
				if (this.resizeObserver) {
					this.resizeObserver.unobserve(this.wrapper);
				} else {
					window.removeEventListener("resize", this.handleResize);
				}
			} else {
				if (this.resizeObserver) {
					this.resizeObserver.observe(this.wrapper);
				} else {
					window.addEventListener("resize", this.handleResize);
				}
			}
		}
	}

	componentWillUnmount(): void {
		if (!this.wrapper) throw new Error("Ref is null");
		this.wrapper.removeEventListener("scroll", this.handleScroll);
		if (this.props.dynamicallySized) {
			if (this.resizeObserver) {
				this.resizeObserver.unobserve(this.wrapper);
			} else {
				window.removeEventListener("resize", this.handleResize);
			}
		}
	}

	render(): React.ReactElement {
		return (
			<div className={this.props.className} ref={this.setScrollerRef}>
				{this.props.children}
			</div>
		);
	}

	setScrollerRef = (ref: HTMLElement | null): void => {
		this.wrapper = ref;
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
	 * that arrived in the meantime fills the container and moves the bottom away.
	 */
	private callLoad = (name: LoadCallbackName): void => {
		if (name === "loadMoreTop") {
			const loadMoreTop = this.props.loadMoreTop;
			if (loadMoreTop) loadMoreTop();
			return;
		}
		if (!this.wrapper) return;
		if (isFilled(this.wrapper) && !isAtBottom(this.wrapper)) return;
		const loadMoreBottom = this.props.loadMoreBottom;
		loadMoreBottom();
	};

	handleResize = (): void => {
		if (!this.wrapper) return;

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
