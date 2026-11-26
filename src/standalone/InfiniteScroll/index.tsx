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
	 * Loads more items above the current ones. Leave it `undefined` to disable
	 * loading on top, and set it to `undefined` once there is nothing more
	 * above; otherwise it is called again each time the container is at its
	 * top.
	 *
	 * Called while the container is scrolled to its top (an offset less than
	 * 1px counts as the top), whatever the `threshold`:
	 * - once the content first fills the container (overflows it by more than
	 *   `threshold`): after mount, after the list became short again (e.g. it
	 *   was emptied), after the container was hidden, and when `loadMoreTop`
	 *   is passed after mount. So a list opens at its first row with a page
	 *   already loaded above it;
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
	 * is still at its top; it is not made while the container is hidden, and
	 * waits while `loading` is set.
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
	 * - after mount and after every render with new `children`. This also
	 *   fills the container: a list whose content does not overflow it by more
	 *   than `threshold` is extended until it does. Without `loadMoreBottom`
	 *   the container is filled through `loadMoreTop` instead.
	 *
	 * A call that waits for `callBackDebounce` is only made if, once the wait is
	 * over, `threshold` px or less are still left below the visible part; it
	 * waits while `loading` is set.
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
	 * it by more than this. `0` loads at the very bottom only. A negative
	 * number or `NaN` counts as `0`. Can be changed after mount.
	 *
	 * `loadMoreTop` is called at the top, whatever this value.
	 * @default 250
	 */
	threshold?: number;
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
 * The load callbacks, by prop name
 */
type LoadCallbackName = "loadMoreTop" | "loadMoreBottom";

const LOAD_CALLBACK_NAMES: readonly LoadCallbackName[] = [
	"loadMoreTop",
	"loadMoreBottom",
];

/**
 * The default `threshold`, in CSS pixels
 */
const DEFAULT_THRESHOLD = 250;

/**
 * Does the content overflow the scroll container by more than `threshold`?
 * Until it does, the container is filled through `loadMoreBottom`, or
 * `loadMoreTop` without it.
 */
const isFilled = (wrapper: HTMLElement, threshold: number): boolean =>
	wrapper.scrollHeight > wrapper.clientHeight + threshold;

/**
 * Are `threshold` px or less of content left below the visible part of the
 * scroll container? `scrollTop` can be fractional (e.g. inside an ancestor
 * with CSS `zoom`) while `scrollHeight` and `clientHeight` are rounded to
 * whole pixels, so at the bottom it can be a fraction of a pixel short of
 * their difference or past it. A distance less than 1px more than `threshold`
 * counts too, so with `threshold` 0 a container less than 1px from the bottom
 * is at the bottom.
 */
const isNearBottom = (wrapper: HTMLElement, threshold: number): boolean =>
	wrapper.scrollHeight - wrapper.clientHeight - wrapper.scrollTop <
	threshold + 1;

/**
 * Is the scroll container scrolled to its top? An offset less than 1px counts,
 * like at the bottom (iOS reports negative offsets while it bounces at the
 * top).
 */
const isAtTop = (wrapper: HTMLElement): boolean => wrapper.scrollTop < 1;

/**
 * Has the scroll container been scrolled away from `scrollTop`? Browsers snap
 * a fractional offset that was set to device pixels, so a difference of less
 * than 1px is not a scroll.
 */
const isScrolledFrom = (wrapper: HTMLElement, scrollTop: number): boolean =>
	Math.abs(wrapper.scrollTop - scrollTop) >= 1;

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
 * The visible part of the scroll container (inside its border), in viewport
 * coordinates, and its vertical scale: an ancestor's transform, such as the
 * scale of a Popover's Grow transition while it opens, shrinks what
 * `getBoundingClientRect` reports but not `scrollTop`
 */
const getView = (
	wrapper: HTMLElement,
): { top: number; bottom: number; scale: number } => {
	const box = wrapper.getBoundingClientRect();
	const scale =
		wrapper.offsetHeight > 0 && box.height > 0
			? box.height / wrapper.offsetHeight
			: 1;
	const top = box.top + wrapper.clientTop * scale;
	return { top, bottom: top + wrapper.clientHeight * scale, scale };
};

/**
 * The distance of an element's top edge from the scroll container's visible
 * top edge, in the container's CSS pixels
 */
const getOffsetInView = (wrapper: HTMLElement, element: Element): number => {
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
const findAnchorElement = (
	parent: Element,
	viewTop: number,
	viewBottom: number,
): Element | null => {
	for (const child of Array.from(parent.children)) {
		const rect = child.getBoundingClientRect();
		if (rect.height === 0) {
			const inner = findAnchorElement(child, viewTop, viewBottom);
			if (inner) return inner;
			continue;
		}
		if (rect.bottom <= viewTop || rect.top >= viewBottom) continue;
		if (rect.top >= viewTop && rect.bottom <= viewBottom) return child;
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
 *
 * It renders no loader, end-of-list or error row and announces nothing:
 * render those inside or around it, with the status as text in a polite live
 * region (`role="status"`) outside the container, and pass `loading` while a
 * load runs.
 */
class InfiniteScroll extends PureComponent<InfiniteScrollProps> {
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
	/**
	 * The anchor that keeps the rows in view in place after rows were added
	 * above them while the container was at its top. It is held until the
	 * container is scrolled to another offset (by the user, the consumer or
	 * the browser's own scroll anchoring), because the rows above can still
	 * change their height after they were added, e.g. a placeholder that is
	 * replaced by its data.
	 */
	private heldAnchor: ScrollAnchor | null = null;
	/**
	 * The `scrollTop` that holding the anchor left; any other offset means
	 * the container was scrolled since, which releases the anchor
	 */
	private heldScrollTop = 0;
	/**
	 * Observes the size of the container's children while an anchor is held;
	 * created when an anchor is first held
	 */
	private contentObserver: ResizeObserver | null = null;
	/**
	 * Is `loadMoreTop` due once the content fills the container? Set at
	 * mount, while the content does not fill the container, while the
	 * container is hidden and when `loadMoreTop` is passed; cleared by the
	 * fill check that finds the container filled. A container that is at its
	 * top fires no scroll event when the user scrolls up, so this is how a
	 * list that is at its top gets the rows above it.
	 */
	private topLoadDue = true;
	/**
	 * The calls that came up while `loading` was set, per callback; they are
	 * requested again once `loading` turns false
	 */
	private heldLoads: Record<LoadCallbackName, boolean> = {
		loadMoreTop: false,
		loadMoreBottom: false,
	};

	constructor(props: InfiniteScrollProps) {
		super(props);

		this.resizeObserver = window.ResizeObserver
			? new ResizeObserver(this.handleResize)
			: null;
	}

	componentDidMount(): void {
		if (!this.wrapper) throw new Error("Ref is null");

		// StrictMode mounts the same instance again after unmounting it
		this.topLoadDue = true;
		this.heldLoads = { loadMoreTop: false, loadMoreBottom: false };

		this.wrapper.addEventListener("scroll", this.handleScroll);
		this.handleResize();
		this.observeSize();
	}

	/**
	 * Takes the anchor that keeps the rows in view in place when `children`
	 * change while the container is at its top and loading on top is enabled:
	 * browsers' scroll anchoring does not apply to a container at its top.
	 */
	getSnapshotBeforeUpdate(
		prevProps: Readonly<InfiniteScrollProps>,
	): ScrollAnchor | null {
		const wrapper = this.wrapper;
		if (
			!wrapper ||
			this.heldAnchor ||
			prevProps.children === this.props.children ||
			!(prevProps.loadMoreTop || this.props.loadMoreTop) ||
			!isAtTop(wrapper)
		) {
			return null;
		}
		const view = getView(wrapper);
		const element = findAnchorElement(wrapper, view.top, view.bottom);
		if (!element) return null;
		this.heldScrollTop = wrapper.scrollTop;
		return { element, offset: getOffsetInView(wrapper, element) };
	}

	componentDidUpdate(
		prevProps: Readonly<InfiniteScrollProps>,
		_prevState: unknown,
		anchor: ScrollAnchor | null,
	): void {
		if (anchor) this.heldAnchor = anchor;
		if (this.heldAnchor) {
			if (anchor || prevProps.children !== this.props.children) {
				this.observeContent();
			}
			this.holdAnchor();
		}
		if (!prevProps.loadMoreTop && this.props.loadMoreTop) {
			this.topLoadDue = true;
		}
		if (
			prevProps.children !== this.props.children ||
			!prevProps.loadMoreTop !== !this.props.loadMoreTop ||
			!prevProps.loadMoreBottom !== !this.props.loadMoreBottom ||
			!Object.is(prevProps.threshold, this.props.threshold)
		) {
			this.handleResize();
		}
		if (prevProps.loading && !this.props.loading) {
			this.requestHeldLoads();
		}
		if (!!prevProps.dynamicallySized !== !!this.props.dynamicallySized) {
			this.observeSize();
		}
	}

	componentWillUnmount(): void {
		this.cancelLoad("loadMoreTop");
		this.cancelLoad("loadMoreBottom");
		this.releaseAnchor();
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
			loading,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			threshold,
			tabIndex,
			...containerProps
		} = this.props;
		return (
			<ScrollContainer
				{...containerProps}
				aria-busy={containerProps["aria-busy"] ?? (loading || undefined)}
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
	private observeContent = (): void => {
		if (!this.wrapper || !window.ResizeObserver) return;
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
	private holdAnchor = (): void => {
		const wrapper = this.wrapper;
		const anchor = this.heldAnchor;
		if (!wrapper || !anchor) return;
		if (
			isScrolledFrom(wrapper, this.heldScrollTop) ||
			!anchor.element.isConnected ||
			hasNoLayoutBox(wrapper)
		) {
			this.releaseAnchor();
			return;
		}
		const moved = getOffsetInView(wrapper, anchor.element) - anchor.offset;
		if (moved !== 0) wrapper.scrollTop += moved;
		this.heldScrollTop = wrapper.scrollTop;
	};

	/**
	 * Stops holding the anchor
	 */
	private releaseAnchor = (): void => {
		this.heldAnchor = null;
		this.contentObserver?.disconnect();
	};

	/**
	 * Requests `loadMoreTop` if it is due (see `topLoadDue`) and the
	 * container is at its top. Called once the content fills the container.
	 */
	private loadTopIfDue = (): void => {
		if (!this.wrapper || !this.topLoadDue) return;
		this.topLoadDue = false;
		if (this.props.loadMoreTop && isAtTop(this.wrapper)) {
			this.requestLoad("loadMoreTop");
		}
	};

	/**
	 * Requests a call of the `loadMoreTop` or `loadMoreBottom` prop: debounced by
	 * `callBackDebounce` (a request replaces the pending one), or right away for 0
	 */
	private requestLoad = (name: LoadCallbackName): void => {
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
	private cancelLoad = (name: LoadCallbackName): void => {
		window.clearTimeout(this.loadTimers[name]);
		this.loadTimers[name] = 0;
	};

	/**
	 * Requests the calls held while `loading` was set (see `callLoad`) again,
	 * now that it turned false
	 */
	private requestHeldLoads = (): void => {
		for (const name of LOAD_CALLBACK_NAMES) {
			if (!this.heldLoads[name]) continue;
			this.heldLoads[name] = false;
			this.requestLoad(name);
		}
	};

	/**
	 * The `threshold` prop, with its default; a negative number or NaN counts
	 * as 0
	 */
	private getThreshold = (): number => {
		const threshold = this.props.threshold ?? DEFAULT_THRESHOLD;
		return threshold > 0 ? threshold : 0;
	};

	/**
	 * Makes a call requested by `requestLoad`. The callback is read from the
	 * props now, so it is the one of the latest render. A call is only made if
	 * the content still needs it: a request made while the content was short,
	 * or while the container was near that end, is dropped once content that
	 * arrived in the meantime fills the container and moves that end away, and
	 * one is not made while the container is hidden (`pauseFillWhileHidden`).
	 * While `loading` is set, the call is held and requested again once it
	 * turns false. A fill call that is dropped because the content now fills
	 * the container (rows that grew on their own) lets the due `loadMoreTop`
	 * follow.
	 */
	private callLoad = (name: LoadCallbackName): void => {
		if (!this.wrapper || this.pauseFillWhileHidden()) return;
		if (this.props.loading) {
			this.heldLoads[name] = true;
			return;
		}
		const threshold = this.getThreshold();
		const atEnd =
			name === "loadMoreTop"
				? isAtTop(this.wrapper)
				: isNearBottom(this.wrapper, threshold);
		if (isFilled(this.wrapper, threshold) && !atEnd) {
			this.loadTopIfDue();
			return;
		}
		const load = this.props[name];
		if (load) load();
	};

	/**
	 * The fill check, run after mount, after every render with new `children`,
	 * a callback that was added or removed or a new `threshold`, and on size
	 * changes that are observed: requests `loadMoreBottom` while `threshold`
	 * px or less are left below the visible part (which includes content that
	 * does not fill the container), or `loadMoreTop` without it while the
	 * content does not fill the container, and the due `loadMoreTop` once it
	 * does.
	 */
	handleResize = (): void => {
		if (!this.wrapper || this.pauseFillWhileHidden()) return;

		const threshold = this.getThreshold();
		const filled = isFilled(this.wrapper, threshold);
		if (!filled) this.topLoadDue = true;
		if (this.props.loadMoreBottom) {
			if (isNearBottom(this.wrapper, threshold)) {
				this.requestLoad("loadMoreBottom");
			}
		} else if (!filled && this.props.loadMoreTop) {
			this.requestLoad("loadMoreTop");
		}
		if (filled) this.loadTopIfDue();
	};

	handleScroll = (): void => {
		if (!this.wrapper) return;

		if (this.heldAnchor && isScrolledFrom(this.wrapper, this.heldScrollTop)) {
			this.releaseAnchor();
		}
		if (this.props.loadMoreTop && isAtTop(this.wrapper)) {
			this.requestLoad("loadMoreTop");
		}
		if (
			this.props.loadMoreBottom &&
			isNearBottom(this.wrapper, this.getThreshold())
		) {
			this.requestLoad("loadMoreBottom");
		}
	};
}

export default InfiniteScroll;
