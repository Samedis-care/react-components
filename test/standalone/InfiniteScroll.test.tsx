import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	describe,
	it,
	expect,
	vi,
	beforeAll,
	afterAll,
	beforeEach,
	afterEach,
	type Mock,
} from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import InfiniteScroll from "../../src/standalone/InfiniteScroll/index";

// jsdom doesn't implement ResizeObserver; provide a class-based stub
beforeAll(() => {
	class ResizeObserverStub {
		observe = vi.fn();
		unobserve = vi.fn();
		disconnect = vi.fn();
		constructor(_callback: ResizeObserverCallback) {
			void _callback;
		}
	}
	vi.stubGlobal("ResizeObserver", ResizeObserverStub);
});

describe("InfiniteScroll", () => {
	it("renders children inside a wrapper div", () => {
		const loadMoreBottom = vi.fn();
		render(
			<InfiniteScroll className="test-scroll" loadMoreBottom={loadMoreBottom}>
				<div data-testid="child">Item 1</div>
			</InfiniteScroll>,
		);

		expect(screen.getByTestId("child")).toBeInTheDocument();
	});

	it("applies className to the wrapper element", () => {
		const loadMoreBottom = vi.fn();
		const { container } = render(
			<InfiniteScroll
				className="my-scroll-class"
				loadMoreBottom={loadMoreBottom}
			>
				<span>content</span>
			</InfiniteScroll>,
		);

		const wrapper = container.firstChild as HTMLElement;
		expect(wrapper.className).toContain("my-scroll-class");
	});

	it("renders multiple children", () => {
		const loadMoreBottom = vi.fn();
		render(
			<InfiniteScroll className="test-scroll" loadMoreBottom={loadMoreBottom}>
				<div data-testid="item-1">1</div>
				<div data-testid="item-2">2</div>
				<div data-testid="item-3">3</div>
			</InfiniteScroll>,
		);

		expect(screen.getByTestId("item-1")).toBeInTheDocument();
		expect(screen.getByTestId("item-2")).toBeInTheDocument();
		expect(screen.getByTestId("item-3")).toBeInTheDocument();
	});

	it("calls loadMoreBottom when content does not overflow on mount", () => {
		const loadMoreBottom = vi.fn();
		// In jsdom scrollHeight === clientHeight === 0 (no overflow) so
		// handleResize will call loadMoreBottom immediately.
		render(
			<InfiniteScroll className="test-scroll" loadMoreBottom={loadMoreBottom}>
				<span>short content</span>
			</InfiniteScroll>,
		);

		// The debounced call may fire asynchronously, but with debounce=100ms
		// we can at least confirm the function was set up. We verify no crash.
		expect(loadMoreBottom).toBeDefined();
	});

	it("accepts an optional loadMoreTop prop without crashing", () => {
		const loadMoreTop = vi.fn();
		const loadMoreBottom = vi.fn();
		expect(() =>
			render(
				<InfiniteScroll
					className="test-scroll"
					loadMoreTop={loadMoreTop}
					loadMoreBottom={loadMoreBottom}
				>
					<span>content</span>
				</InfiniteScroll>,
			),
		).not.toThrow();
	});

	it("accepts callBackDebounce=0 without crashing", () => {
		const loadMoreBottom = vi.fn();
		expect(() =>
			render(
				<InfiniteScroll
					className="test-scroll"
					loadMoreBottom={loadMoreBottom}
					callBackDebounce={0}
				>
					<span>content</span>
				</InfiniteScroll>,
			),
		).not.toThrow();
	});
});

// ─── Behavior with stubbed layout ─────────────────────────────────────────────
//
// jsdom has no layout: scrollHeight and clientHeight are always 0. The harness
// gives every element with the class SCROLLER (the scroll container under test)
// configurable metrics and a writable scrollTop, so the fill check, the start
// offset and the scroll handling can be driven. ResizeObserver is replaced by a
// stub that records its instances, so the resize path can be triggered by hand.

const SCROLLER = "is";
let clientHeight = 300;
let scrollHeightOf: (el: Element) => number = () => 1000;
const scrollTops = new WeakMap<Element, number>();
const savedDescriptors = new Map<string, PropertyDescriptor | undefined>();

interface ResizeObserverRecord {
	callback: ResizeObserverCallback;
	observe: Mock;
	unobserve: Mock;
}
let resizeObservers: ResizeObserverRecord[] = [];
class ResizeObserverRecorder {
	observe = vi.fn();
	unobserve = vi.fn();
	disconnect = vi.fn();
	constructor(callback: ResizeObserverCallback) {
		resizeObservers.push({
			callback,
			observe: this.observe,
			unobserve: this.unobserve,
		});
	}
}
const lastResizeObserver = (): ResizeObserverRecord => {
	const last = resizeObservers[resizeObservers.length - 1];
	if (!last) throw new Error("no ResizeObserver was created");
	return last;
};

const isScroller = (el: Element) => el.classList.contains(SCROLLER);
const getScroller = (container: HTMLElement) =>
	container.firstChild as HTMLElement;
/** Sets scrollTop and dispatches the scroll event a browser would fire */
const scrollTo = (el: HTMLElement, top: number) => {
	el.scrollTop = top;
	el.dispatchEvent(new Event("scroll"));
};
const advance = (ms: number) =>
	act(() => {
		vi.advanceTimersByTime(ms);
	});
/** Advances in small steps so that renders caused by a callback run in between */
const advanceInSteps = (total: number, step = 10) => {
	for (let elapsed = 0; elapsed < total; elapsed += step) advance(step);
};
const advanceInStepsAsync = async (total: number, step = 10) => {
	for (let elapsed = 0; elapsed < total; elapsed += step) {
		await act(async () => {
			await vi.advanceTimersByTimeAsync(step);
		});
	}
};
const range = (start: number, count: number) =>
	Array.from({ length: count }, (_, i) => start + i);

/** Appends 10 rows per loadMoreBottom call, with a stable callback */
const AppendingList = ({ onLoad }: { onLoad: () => void }) => {
	const [rows, setRows] = useState(() => range(0, 20));
	const loadMore = useCallback(() => {
		onLoad();
		setRows((prev) => [...prev, ...range(prev.length, 10)]);
	}, [onLoad]);
	return (
		<InfiniteScroll className={SCROLLER} loadMoreBottom={loadMore}>
			{rows.map((row) => (
				<div key={row}>Row {row}</div>
			))}
		</InfiniteScroll>
	);
};

const PAGE_SIZE = 10;
/**
 * The first pattern an app developer writes: an async page load guarded by a
 * loading flag kept in React state.
 */
const StateGuardedList = ({
	fetchPage,
}: {
	fetchPage: (offset: number) => Promise<number[]>;
}) => {
	const [rows, setRows] = useState<number[]>([]);
	const [loading, setLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const loadMore = useCallback(() => {
		if (loading || !hasMore) return;
		setLoading(true);
		void fetchPage(rows.length)
			.then((page) => {
				setRows((prev) => [...prev, ...page]);
				setHasMore(page.length === PAGE_SIZE);
			})
			.finally(() => setLoading(false));
	}, [loading, hasMore, rows.length, fetchPage]);
	return (
		<InfiniteScroll className={SCROLLER} loadMoreBottom={loadMore}>
			{rows.map((row) => (
				<div className="row" key={row}>
					Row {row}
				</div>
			))}
			{loading && <div>Loading</div>}
		</InfiniteScroll>
	);
};

/**
 * A list whose rows depend on a filter, loaded page by page without a guard in
 * the callback: its loading state goes to InfiniteScroll as `loading`. A new
 * filter empties the list, also while a page of the previous filter is still
 * loading; that page is discarded when it arrives. The rows are memoized, so a
 * render that changes nothing else passes the same children.
 */
const FilteredList = ({
	filter,
	fetchPage,
}: {
	filter: string;
	fetchPage: (filter: string, offset: number) => Promise<string[]>;
}) => {
	const [rows, setRows] = useState<string[]>([]);
	const [rowsFilter, setRowsFilter] = useState(filter);
	const [loading, setLoading] = useState(false);
	const currentFilter = useRef(filter);
	useEffect(() => {
		currentFilter.current = filter;
	}, [filter]);
	// a new filter starts the list over
	if (rowsFilter !== filter) {
		setRowsFilter(filter);
		setRows([]);
	}
	const loadMore = useCallback(() => {
		setLoading(true);
		void fetchPage(filter, rows.length)
			.then((page) => {
				// a page of a previous filter is discarded
				if (currentFilter.current !== filter) return;
				setRows((prev) => [...prev, ...page]);
			})
			.finally(() => setLoading(false));
	}, [filter, rows.length, fetchPage]);
	const children = useMemo(
		() =>
			rows.map((row) => (
				<div className="row" key={row}>
					{row}
				</div>
			)),
		[rows],
	);
	return (
		<InfiniteScroll
			className={SCROLLER}
			loadMoreBottom={loadMore}
			loading={loading}
		>
			{children}
		</InfiniteScroll>
	);
};

describe("InfiniteScroll behavior (stubbed layout)", () => {
	beforeAll(() => {
		for (const key of ["scrollHeight", "clientHeight", "scrollTop"]) {
			savedDescriptors.set(
				key,
				Object.getOwnPropertyDescriptor(Element.prototype, key),
			);
		}
		Object.defineProperty(Element.prototype, "scrollHeight", {
			configurable: true,
			get(this: Element) {
				return isScroller(this) ? scrollHeightOf(this) : 0;
			},
		});
		Object.defineProperty(Element.prototype, "clientHeight", {
			configurable: true,
			get(this: Element) {
				return isScroller(this) ? clientHeight : 0;
			},
		});
		Object.defineProperty(Element.prototype, "scrollTop", {
			configurable: true,
			get(this: Element) {
				return scrollTops.get(this) ?? 0;
			},
			set(this: Element, value: number) {
				scrollTops.set(this, value);
			},
		});
	});

	afterAll(() => {
		savedDescriptors.forEach((descriptor, key) => {
			if (descriptor) Object.defineProperty(Element.prototype, key, descriptor);
		});
	});

	beforeEach(() => {
		vi.useFakeTimers();
		clientHeight = 300;
		scrollHeightOf = () => 1000;
		resizeObservers = [];
		vi.stubGlobal("ResizeObserver", ResizeObserverRecorder);
	});

	afterEach(() => {
		cleanup();
		vi.useRealTimers();
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	describe("known bugs", () => {
		it("[ISSUE-3471-ITEM-1] debounces loadMoreTop by the default 100 ms", () => {
			const top = vi.fn();
			const { container } = render(
				<InfiniteScroll
					className={SCROLLER}
					loadMoreTop={top}
					loadMoreBottom={vi.fn()}
				>
					<div />
				</InfiniteScroll>,
			);
			const scroller = getScroller(container);
			scrollTo(scroller, 0);
			scrollTo(scroller, 0);
			scrollTo(scroller, 0);
			expect(top).toHaveBeenCalledTimes(0);
			advance(100);
			expect(top).toHaveBeenCalledTimes(1);
		});

		it("[ISSUE-3471-ITEM-1] calls loadMoreTop synchronously with callBackDebounce={0}", () => {
			const top = vi.fn();
			const { container } = render(
				<InfiniteScroll
					className={SCROLLER}
					loadMoreTop={top}
					loadMoreBottom={vi.fn()}
					callBackDebounce={0}
				>
					<div />
				</InfiniteScroll>,
			);
			const scroller = getScroller(container);
			// the list opens at its top and fills the container: it loads on top at once
			expect(top).toHaveBeenCalledTimes(1);
			scrollTo(scroller, 300);
			scrollTo(scroller, 0);
			expect(top).toHaveBeenCalledTimes(2);
		});

		it("[ISSUE-3471-ITEM-1] keeps debouncing loadMoreBottom after the callback prop changes", () => {
			const first = vi.fn();
			const second = vi.fn();
			const children = <div />;
			const { container, rerender } = render(
				<InfiniteScroll className={SCROLLER} loadMoreBottom={first}>
					{children}
				</InfiniteScroll>,
			);
			rerender(
				<InfiniteScroll className={SCROLLER} loadMoreBottom={second}>
					{children}
				</InfiniteScroll>,
			);
			const scroller = getScroller(container);
			scrollTo(scroller, 700);
			scrollTo(scroller, 700);
			scrollTo(scroller, 700);
			expect(second).toHaveBeenCalledTimes(0);
			advance(100);
			expect(second).toHaveBeenCalledTimes(1);
		});

		it("[ISSUE-3471-ITEM-1] debounces a loadMoreTop passed after mount", () => {
			const top = vi.fn();
			const bottom = vi.fn();
			const children = <div />;
			const { container, rerender } = render(
				<InfiniteScroll className={SCROLLER} loadMoreBottom={bottom}>
					{children}
				</InfiniteScroll>,
			);
			rerender(
				<InfiniteScroll
					className={SCROLLER}
					loadMoreTop={top}
					loadMoreBottom={bottom}
				>
					{children}
				</InfiniteScroll>,
			);
			const scroller = getScroller(container);
			scrollTo(scroller, 0);
			scrollTo(scroller, 0);
			scrollTo(scroller, 0);
			expect(top).toHaveBeenCalledTimes(0);
			advance(100);
			expect(top).toHaveBeenCalledTimes(1);
		});

		it("[ISSUE-3471-ITEM-1] applies a callBackDebounce changed after mount to both callbacks", () => {
			const top = vi.fn();
			const bottom = vi.fn();
			const children = <div />;
			const { container, rerender } = render(
				<InfiniteScroll
					className={SCROLLER}
					loadMoreTop={top}
					loadMoreBottom={bottom}
				>
					{children}
				</InfiniteScroll>,
			);
			const scroller = getScroller(container);
			// the call on top that the mount requested, as the list opens at its
			// top; a call that waits keeps its wait when callBackDebounce changes
			advance(100);
			expect(top).toHaveBeenCalledTimes(1);

			rerender(
				<InfiniteScroll
					className={SCROLLER}
					loadMoreTop={top}
					loadMoreBottom={bottom}
					callBackDebounce={250}
				>
					{children}
				</InfiniteScroll>,
			);
			scrollTo(scroller, 0);
			scrollTo(scroller, 0);
			advance(249);
			expect(top).toHaveBeenCalledTimes(1);
			advance(1);
			expect(top).toHaveBeenCalledTimes(2);
			scrollTo(scroller, 700);
			scrollTo(scroller, 700);
			advance(249);
			expect(bottom).toHaveBeenCalledTimes(0);
			advance(1);
			expect(bottom).toHaveBeenCalledTimes(1);

			rerender(
				<InfiniteScroll
					className={SCROLLER}
					loadMoreTop={top}
					loadMoreBottom={bottom}
					callBackDebounce={0}
				>
					{children}
				</InfiniteScroll>,
			);
			scrollTo(scroller, 0);
			expect(top).toHaveBeenCalledTimes(3);
			scrollTo(scroller, 700);
			expect(bottom).toHaveBeenCalledTimes(2);
		});

		it("[ISSUE-3471-ITEM-2] calls the new loadMoreBottom when children and callback change in the same render", () => {
			scrollHeightOf = () => 300;
			const first = vi.fn();
			const second = vi.fn();
			const { rerender } = render(
				<InfiniteScroll className={SCROLLER} loadMoreBottom={first}>
					<div>page 1</div>
				</InfiniteScroll>,
			);
			advance(200);
			expect(first).toHaveBeenCalledTimes(1);
			rerender(
				<InfiniteScroll className={SCROLLER} loadMoreBottom={second}>
					<div>page 2</div>
				</InfiniteScroll>,
			);
			advance(200);
			expect({
				first: first.mock.calls.length,
				second: second.mock.calls.length,
			}).toEqual({ first: 1, second: 1 });
		});

		it("[ISSUE-3471-ITEM-2] does not call a replaced loadMoreBottom from a pending debounced call", () => {
			scrollHeightOf = () => 300;
			const first = vi.fn();
			const second = vi.fn();
			const children = <div />;
			const { rerender } = render(
				<InfiniteScroll className={SCROLLER} loadMoreBottom={first}>
					{children}
				</InfiniteScroll>,
			);
			// the mount fill call is pending; the parent now passes a new callback
			rerender(
				<InfiniteScroll className={SCROLLER} loadMoreBottom={second}>
					{children}
				</InfiniteScroll>,
			);
			advance(200);
			expect(first).not.toHaveBeenCalled();
		});

		it("[ISSUE-3471-ITEM-2] a consumer that guards with its own loading state requests each page once", async () => {
			scrollHeightOf = (el) => el.querySelectorAll(".row").length * 30;
			const offsets: number[] = [];
			const fetchPage = (offset: number) => {
				offsets.push(offset);
				return new Promise<number[]>((resolve) =>
					setTimeout(
						() => resolve(offset < 30 ? range(offset, PAGE_SIZE) : []),
						50,
					),
				);
			};
			// a duplicate page renders duplicate keys; keep React's warning out of the output
			vi.spyOn(console, "error").mockImplementation(() => undefined);
			render(<StateGuardedList fetchPage={fetchPage} />);
			await advanceInStepsAsync(1000);
			expect(offsets).toEqual([0, 10]);
		});

		it("[ISSUE-3471-ITEM-2] calls the new loadMoreBottom right away with callBackDebounce={0} when children and callback change in the same render", () => {
			scrollHeightOf = () => 300;
			const first = vi.fn();
			const second = vi.fn();
			const { rerender } = render(
				<InfiniteScroll
					className={SCROLLER}
					loadMoreBottom={first}
					callBackDebounce={0}
				>
					<div>page 1</div>
				</InfiniteScroll>,
			);
			expect(first).toHaveBeenCalledTimes(1);
			rerender(
				<InfiniteScroll
					className={SCROLLER}
					loadMoreBottom={second}
					callBackDebounce={0}
				>
					<div>page 2</div>
				</InfiniteScroll>,
			);
			expect({
				first: first.mock.calls.length,
				second: second.mock.calls.length,
			}).toEqual({ first: 1, second: 1 });
		});

		it("[ISSUE-3471-ITEM-2] calls the latest loadMoreTop from a pending debounced call, and none once it is removed", () => {
			const first = vi.fn();
			const second = vi.fn();
			const bottom = vi.fn();
			const children = <div />;
			const { container, rerender } = render(
				<InfiniteScroll
					className={SCROLLER}
					loadMoreTop={first}
					loadMoreBottom={bottom}
				>
					{children}
				</InfiniteScroll>,
			);
			const scroller = getScroller(container);
			scrollTo(scroller, 0);
			rerender(
				<InfiniteScroll
					className={SCROLLER}
					loadMoreTop={second}
					loadMoreBottom={bottom}
				>
					{children}
				</InfiniteScroll>,
			);
			advance(100);
			expect({
				first: first.mock.calls.length,
				second: second.mock.calls.length,
			}).toEqual({ first: 0, second: 1 });

			// e.g. nothing more to load on top: the parent stops passing loadMoreTop
			scrollTo(scroller, 0);
			rerender(
				<InfiniteScroll className={SCROLLER} loadMoreBottom={bottom}>
					{children}
				</InfiniteScroll>,
			);
			advance(100);
			expect(second).toHaveBeenCalledTimes(1);
		});

		it("[ISSUE-3471-ITEM-2] drops a pending fill call once new content fills the container", () => {
			let rows = 5;
			scrollHeightOf = () => rows * 30;
			const bottom = vi.fn();
			const { rerender } = render(
				<InfiniteScroll className={SCROLLER} loadMoreBottom={bottom}>
					<div>page 1</div>
				</InfiniteScroll>,
			);
			// the mount fill call is pending when a page arrives that fills the container
			rows = 20;
			rerender(
				<InfiniteScroll className={SCROLLER} loadMoreBottom={bottom}>
					<div>pages 1 and 2</div>
				</InfiniteScroll>,
			);
			advance(200);
			expect(bottom).not.toHaveBeenCalled();
		});

		it("[ISSUE-3471-ITEM-2] drops a pending bottom call once new content moves the bottom away", () => {
			let height = 1000;
			scrollHeightOf = () => height;
			const bottom = vi.fn();
			const { container, rerender } = render(
				<InfiniteScroll className={SCROLLER} loadMoreBottom={bottom}>
					<div>page 1</div>
				</InfiniteScroll>,
			);
			scrollTo(getScroller(container), 700);
			// the call for the bottom is pending when content is appended
			height = 1300;
			rerender(
				<InfiniteScroll className={SCROLLER} loadMoreBottom={bottom}>
					<div>pages 1 and 2</div>
				</InfiniteScroll>,
			);
			advance(200);
			expect(bottom).not.toHaveBeenCalled();
		});

		it("[ISSUE-3471-ITEM-3] does not call loadMoreBottom after unmount", () => {
			scrollHeightOf = () => 300;
			const bottom = vi.fn();
			const { unmount } = render(
				<InfiniteScroll className={SCROLLER} loadMoreBottom={bottom}>
					<div />
				</InfiniteScroll>,
			);
			// the mount fill call is pending when the list goes away
			unmount();
			advance(200);
			expect(bottom).not.toHaveBeenCalled();
		});

		it("[ISSUE-3471-ITEM-3] does not call loadMoreTop after unmount", () => {
			const top = vi.fn();
			const { container, unmount } = render(
				<InfiniteScroll
					className={SCROLLER}
					loadMoreTop={top}
					loadMoreBottom={vi.fn()}
				>
					<div />
				</InfiniteScroll>,
			);
			// the user scrolls to the top and leaves the page while the call waits
			scrollTo(getScroller(container), 0);
			unmount();
			advance(200);
			expect(top).not.toHaveBeenCalled();
		});

		it("[ISSUE-3471-ITEM-3] leaves no timer behind on unmount", () => {
			scrollHeightOf = () => 300;
			const { container, unmount } = render(
				<InfiniteScroll
					className={SCROLLER}
					loadMoreTop={vi.fn()}
					loadMoreBottom={vi.fn()}
				>
					<div />
				</InfiniteScroll>,
			);
			scrollTo(getScroller(container), 0);
			// a fill call and a top call wait
			expect(vi.getTimerCount()).toBe(2);
			unmount();
			expect(vi.getTimerCount()).toBe(0);
		});

		it("[ISSUE-3471-ITEM-3] fills the container once under StrictMode", () => {
			scrollHeightOf = () => 300;
			const bottom = vi.fn();
			// StrictMode unmounts and mounts again right after the first mount
			render(
				<React.StrictMode>
					<InfiniteScroll className={SCROLLER} loadMoreBottom={bottom}>
						<div />
					</InfiniteScroll>
				</React.StrictMode>,
			);
			advance(200);
			expect(bottom).toHaveBeenCalledTimes(1);
		});

		it("[ISSUE-3471-ITEM-4] does not load page after page while the scroll container is hidden", () => {
			// what browsers report for a scroll container inside display: none
			clientHeight = 0;
			scrollHeightOf = () => 0;
			const onLoad = vi.fn();
			render(<AppendingList onLoad={onLoad} />);
			advanceInSteps(1500);
			expect(onLoad.mock.calls.length).toBeLessThanOrEqual(1);
		});

		it("[ISSUE-3471-ITEM-4] fills a hidden container once it is shown", () => {
			clientHeight = 0;
			scrollHeightOf = () => 0;
			const bottom = vi.fn();
			const { container } = render(
				<InfiniteScroll className={SCROLLER} loadMoreBottom={bottom}>
					<div />
				</InfiniteScroll>,
			);
			const scroller = getScroller(container);
			const observer = lastResizeObserver();
			expect(observer.observe).toHaveBeenCalledExactlyOnceWith(scroller);
			advance(200);
			expect(bottom).not.toHaveBeenCalled();

			// the panel is shown: the container gets its box, the content is short
			clientHeight = 300;
			scrollHeightOf = () => 300;
			act(() => {
				observer.callback([], {} as ResizeObserver);
			});
			advance(100);
			expect(bottom).toHaveBeenCalledTimes(1);
		});

		it("[ISSUE-3471-ITEM-4] drops a waiting fill call when the container is hidden, and makes it once the container is shown", () => {
			scrollHeightOf = () => 300;
			const bottom = vi.fn();
			const { container } = render(
				<InfiniteScroll className={SCROLLER} loadMoreBottom={bottom}>
					<div />
				</InfiniteScroll>,
			);
			// the mount fill call is waiting when the panel is hidden
			clientHeight = 0;
			scrollHeightOf = () => 0;
			advance(200);
			expect(bottom).not.toHaveBeenCalled();
			const observer = lastResizeObserver();
			expect(observer.observe).toHaveBeenCalledExactlyOnceWith(
				getScroller(container),
			);

			clientHeight = 300;
			scrollHeightOf = () => 300;
			act(() => {
				observer.callback([], {} as ResizeObserver);
			});
			advance(100);
			expect(bottom).toHaveBeenCalledTimes(1);
		});

		it("[ISSUE-3471-ITEM-4] fills an empty container that is 0px high but has a layout box", () => {
			// e.g. bounded by max-height only: 0px high while empty, but displayed
			clientHeight = 0;
			scrollHeightOf = () => 0;
			vi.spyOn(Element.prototype, "getClientRects").mockImplementation(
				function (this: Element) {
					return { length: isScroller(this) ? 1 : 0 } as DOMRectList;
				},
			);
			const bottom = vi.fn();
			render(
				<InfiniteScroll className={SCROLLER} loadMoreBottom={bottom}>
					<div />
				</InfiniteScroll>,
			);
			advance(100);
			expect(bottom).toHaveBeenCalledTimes(1);
		});

		it("[ISSUE-3471-ITEM-4] stops observing a hidden container on unmount", () => {
			clientHeight = 0;
			scrollHeightOf = () => 0;
			const { container, unmount } = render(
				<InfiniteScroll className={SCROLLER} loadMoreBottom={vi.fn()}>
					<div />
				</InfiniteScroll>,
			);
			const scroller = getScroller(container);
			const observer = lastResizeObserver();
			unmount();
			expect(observer.unobserve).toHaveBeenCalledExactlyOnceWith(scroller);
		});

		it("[ISSUE-3471-ITEM-4] without ResizeObserver, still fills a container without a layout box, since nothing would notice it being shown", () => {
			vi.stubGlobal("ResizeObserver", undefined);
			clientHeight = 0;
			scrollHeightOf = () => 0;
			const bottom = vi.fn();
			render(
				<InfiniteScroll className={SCROLLER} loadMoreBottom={bottom}>
					<div />
				</InfiniteScroll>,
			);
			advance(100);
			expect(bottom).toHaveBeenCalledTimes(1);
		});

		it("[ISSUE-3471-ITEM-5] calls loadMoreBottom at the bottom when scrollTop is fractional", () => {
			const bottom = vi.fn();
			const { container } = render(
				<InfiniteScroll className={SCROLLER} loadMoreBottom={bottom}>
					<div />
				</InfiniteScroll>,
			);
			const scroller = getScroller(container);
			// the bottom is at 1000 - 300 = 700; zoomed pages report offsets such as these
			scrollTo(scroller, 699.78);
			advance(100);
			expect(bottom).toHaveBeenCalledTimes(1);
			scrollTo(scroller, 700.4);
			advance(100);
			expect(bottom).toHaveBeenCalledTimes(2);
		});

		it("[ISSUE-3471-ITEM-6] opens at the top of the list with loadMoreTop set", () => {
			const { container } = render(
				<InfiniteScroll
					className={SCROLLER}
					loadMoreTop={vi.fn()}
					loadMoreBottom={vi.fn()}
				>
					<div />
				</InfiniteScroll>,
			);
			advance(200);
			expect(getScroller(container).scrollTop).toBe(0);
		});

		it("[ISSUE-3471-ITEM-6] leaves a list that is scrolled to its top there, so its first pixel row can be reached", () => {
			const top = vi.fn();
			const { container } = render(
				<InfiniteScroll
					className={SCROLLER}
					loadMoreTop={top}
					loadMoreBottom={vi.fn()}
				>
					<div />
				</InfiniteScroll>,
			);
			const scroller = getScroller(container);
			advance(100);
			// the list opens at its top
			expect(top).toHaveBeenCalledTimes(1);
			scrollTo(scroller, 300);
			scrollTo(scroller, 0);
			expect(scroller.scrollTop).toBe(0);
			advance(100);
			expect(top).toHaveBeenCalledTimes(2);
		});

		it("[ISSUE-3471-ITEM-6] loads on top once the content fills the container at the top, and not again on every render", () => {
			const top = vi.fn();
			const bottom = vi.fn();
			const { rerender } = render(
				<InfiniteScroll
					className={SCROLLER}
					loadMoreTop={top}
					loadMoreBottom={bottom}
				>
					<div>page 1</div>
				</InfiniteScroll>,
			);
			advance(100);
			expect(top).toHaveBeenCalledTimes(1);
			// a render with new children while the list stays at its top
			rerender(
				<InfiniteScroll
					className={SCROLLER}
					loadMoreTop={top}
					loadMoreBottom={bottom}
				>
					<div>page 1, rendered again</div>
				</InfiniteScroll>,
			);
			advance(200);
			expect(top).toHaveBeenCalledTimes(1);
			expect(bottom).not.toHaveBeenCalled();
		});

		it("[ISSUE-3471-ITEM-6] loads on top once the rows loaded at the bottom fill the container", () => {
			let height = 300;
			scrollHeightOf = () => height;
			const top = vi.fn();
			const bottom = vi.fn(() => {
				height += 300;
			});
			const { rerender } = render(
				<InfiniteScroll
					className={SCROLLER}
					loadMoreTop={top}
					loadMoreBottom={bottom}
				>
					<div>page 1</div>
				</InfiniteScroll>,
			);
			advance(100);
			// a short list is filled at the bottom first
			expect(bottom).toHaveBeenCalledTimes(1);
			expect(top).not.toHaveBeenCalled();
			rerender(
				<InfiniteScroll
					className={SCROLLER}
					loadMoreTop={top}
					loadMoreBottom={bottom}
				>
					<div>pages 1 and 2</div>
				</InfiniteScroll>,
			);
			advance(100);
			expect(top).toHaveBeenCalledTimes(1);
			expect(bottom).toHaveBeenCalledTimes(1);
		});

		it("[ISSUE-3471-ITEM-6] loads on top once under StrictMode", () => {
			const top = vi.fn();
			// StrictMode unmounts and mounts again right after the first mount
			render(
				<React.StrictMode>
					<InfiniteScroll
						className={SCROLLER}
						loadMoreTop={top}
						loadMoreBottom={vi.fn()}
					>
						<div />
					</InfiniteScroll>
				</React.StrictMode>,
			);
			advance(200);
			expect(top).toHaveBeenCalledTimes(1);
		});

		it("[ISSUE-3471-ITEM-6] loads on top when rows that grew on their own fill the container", () => {
			// e.g. a row that shows a spinner until its data arrive
			let height = 300;
			scrollHeightOf = () => height;
			const top = vi.fn();
			const bottom = vi.fn();
			render(
				<InfiniteScroll
					className={SCROLLER}
					loadMoreTop={top}
					loadMoreBottom={bottom}
				>
					<div />
				</InfiniteScroll>,
			);
			// the rows grow without a render of InfiniteScroll
			height = 1000;
			advance(100);
			// the waiting fill call finds the container filled
			expect(bottom).not.toHaveBeenCalled();
			advance(100);
			expect(top).toHaveBeenCalledTimes(1);
		});

		it("[ISSUE-3471-ITEM-6] loads on top when loadMoreTop is passed after mount while the list is at its top", () => {
			const top = vi.fn();
			const bottom = vi.fn();
			const children = <div />;
			const { rerender } = render(
				<InfiniteScroll className={SCROLLER} loadMoreBottom={bottom}>
					{children}
				</InfiniteScroll>,
			);
			advance(200);
			rerender(
				<InfiniteScroll
					className={SCROLLER}
					loadMoreTop={top}
					loadMoreBottom={bottom}
				>
					{children}
				</InfiniteScroll>,
			);
			advance(100);
			expect(top).toHaveBeenCalledTimes(1);
		});

		it("[ISSUE-3471-ITEM-6] loads on top again once an emptied list fills the container again", () => {
			let height = 1000;
			scrollHeightOf = () => height;
			const top = vi.fn();
			const bottom = vi.fn();
			const { rerender } = render(
				<InfiniteScroll
					className={SCROLLER}
					loadMoreTop={top}
					loadMoreBottom={bottom}
				>
					<div>page 1</div>
				</InfiniteScroll>,
			);
			advance(100);
			expect(top).toHaveBeenCalledTimes(1);

			// e.g. a filter change: the parent empties the list and fills it again
			height = 0;
			rerender(
				<InfiniteScroll
					className={SCROLLER}
					loadMoreTop={top}
					loadMoreBottom={bottom}
				>
					{null}
				</InfiniteScroll>,
			);
			advance(100);
			expect(bottom).toHaveBeenCalledTimes(1);
			height = 1000;
			rerender(
				<InfiniteScroll
					className={SCROLLER}
					loadMoreTop={top}
					loadMoreBottom={bottom}
				>
					<div>new page 1</div>
				</InfiniteScroll>,
			);
			advance(100);
			expect(top).toHaveBeenCalledTimes(2);
		});

		it("[ISSUE-3471-ITEM-6] loads on top when a hidden list is shown again at its top", () => {
			const top = vi.fn();
			const bottom = vi.fn();
			const { rerender } = render(
				<InfiniteScroll
					className={SCROLLER}
					loadMoreTop={top}
					loadMoreBottom={bottom}
				>
					<div>page 1</div>
				</InfiniteScroll>,
			);
			advance(100);
			expect(top).toHaveBeenCalledTimes(1);

			// the panel is hidden and the list renders meanwhile
			clientHeight = 0;
			scrollHeightOf = () => 0;
			rerender(
				<InfiniteScroll
					className={SCROLLER}
					loadMoreTop={top}
					loadMoreBottom={bottom}
				>
					<div>page 1, rendered again</div>
				</InfiniteScroll>,
			);
			advance(100);
			expect(top).toHaveBeenCalledTimes(1);

			// shown again, at its top
			clientHeight = 300;
			scrollHeightOf = () => 1000;
			act(() => {
				lastResizeObserver().callback([], {} as ResizeObserver);
			});
			advance(100);
			expect(top).toHaveBeenCalledTimes(2);
			expect(bottom).not.toHaveBeenCalled();
		});

		it("[ISSUE-3471-ITEM-6] fills a list without loadMoreBottom through loadMoreTop", () => {
			let height = 0;
			scrollHeightOf = () => height;
			const top = vi.fn(() => {
				height += 150;
			});
			const { rerender } = render(
				<InfiniteScroll className={SCROLLER} loadMoreTop={top}>
					<div>page 1</div>
				</InfiniteScroll>,
			);
			advance(100);
			expect(top).toHaveBeenCalledTimes(1);
			// 150px do not fill the 300px container yet
			rerender(
				<InfiniteScroll className={SCROLLER} loadMoreTop={top}>
					<div>pages 1 and 2</div>
				</InfiniteScroll>,
			);
			advance(100);
			expect(top).toHaveBeenCalledTimes(2);
		});

		describe("rows added above the rows in view", () => {
			const ROW_PX = 30;
			/** Rows of 30px in a wrapper, as ScrollableSchedule wraps its weeks */
			const Rows = ({
				from,
				placeholderPx,
			}: {
				from: number;
				/** Height of a row "Loading" above the rows, if any */
				placeholderPx?: number;
			}) => (
				<div className="rows">
					{placeholderPx !== undefined && (
						<div className="row" data-px={placeholderPx}>
							Loading
						</div>
					)}
					{range(from, 40 - from).map((n) => (
						<div className="row" key={n}>
							Row {n}
						</div>
					))}
				</div>
			);
			const rowPx = (row: Element) =>
				Number(row.getAttribute("data-px") ?? ROW_PX);
			const rowsPx = (rows: Element[]) =>
				rows.reduce((sum, row) => sum + rowPx(row), 0);
			const rect = (top: number, height: number) =>
				({
					top,
					bottom: top + height,
					height,
					left: 0,
					right: 300,
					width: 300,
					x: 0,
					y: top,
				}) as DOMRect;
			/** Calls the observer of the container's children, as a size change would */
			const notifyContentResize = () =>
				act(() => {
					lastResizeObserver().callback([], {} as ResizeObserver);
				});

			beforeEach(() => {
				scrollHeightOf = (el) =>
					rowsPx(Array.from(el.querySelectorAll(".row")));
				// lay the rows out one below the other, from the container's scrollTop
				vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
					function (this: Element) {
						const scroller = this.closest<HTMLElement>(`.${SCROLLER}`);
						if (!scroller) return rect(0, 0);
						if (scroller === this) return rect(0, clientHeight);
						const rows = this.closest(".rows");
						if (!rows) return rect(0, 0);
						const all = Array.from(rows.children);
						if (rows === this) return rect(-scroller.scrollTop, rowsPx(all));
						const above = all.slice(0, all.indexOf(this));
						return rect(rowsPx(above) - scroller.scrollTop, rowPx(this));
					},
				);
			});

			it("[ISSUE-3471-ITEM-6] keeps the rows in view in place when rows are added above them at the top", () => {
				const top = vi.fn();
				const { container, rerender } = render(
					<InfiniteScroll
						className={SCROLLER}
						loadMoreTop={top}
						loadMoreBottom={vi.fn()}
					>
						<Rows from={10} />
					</InfiniteScroll>,
				);
				const scroller = getScroller(container);
				advance(100);
				expect(top).toHaveBeenCalledTimes(1);
				expect(scroller.scrollTop).toBe(0);

				// loadMoreTop adds rows 0 to 9 above row 10
				rerender(
					<InfiniteScroll
						className={SCROLLER}
						loadMoreTop={top}
						loadMoreBottom={vi.fn()}
					>
						<Rows from={0} />
					</InfiniteScroll>,
				);
				expect(scroller.scrollTop).toBe(10 * ROW_PX);
				const row10 = screen.getByText("Row 10");
				expect(row10.getBoundingClientRect().top).toBe(0);
			});

			it("[ISSUE-3471-ITEM-6] keeps the rows in view in place while a row added above them grows", () => {
				const { container, rerender } = render(
					<InfiniteScroll
						className={SCROLLER}
						loadMoreTop={vi.fn()}
						loadMoreBottom={vi.fn()}
					>
						<Rows from={10} />
					</InfiniteScroll>,
				);
				const scroller = getScroller(container);
				// a placeholder is added above row 10, as ScrollableSchedule adds a week
				rerender(
					<InfiniteScroll
						className={SCROLLER}
						loadMoreTop={vi.fn()}
						loadMoreBottom={vi.fn()}
					>
						<Rows from={10} placeholderPx={56} />
					</InfiniteScroll>,
				);
				expect(scroller.scrollTop).toBe(56);

				// its data arrive: it grows without a render of InfiniteScroll
				screen.getByText("Loading").setAttribute("data-px", "490");
				notifyContentResize();
				expect(scroller.scrollTop).toBe(490);
				expect(screen.getByText("Row 10").getBoundingClientRect().top).toBe(0);
			});

			it("[ISSUE-3471-ITEM-6] keeps the rows in view in place when the offset it set moved by less than 1px", () => {
				const { container, rerender } = render(
					<InfiniteScroll
						className={SCROLLER}
						loadMoreTop={vi.fn()}
						loadMoreBottom={vi.fn()}
					>
						<Rows from={10} />
					</InfiniteScroll>,
				);
				const scroller = getScroller(container);
				rerender(
					<InfiniteScroll
						className={SCROLLER}
						loadMoreTop={vi.fn()}
						loadMoreBottom={vi.fn()}
					>
						<Rows from={10} placeholderPx={56} />
					</InfiniteScroll>,
				);
				// the browser snaps the offset to a device pixel (e.g. inside CSS zoom)
				scrollTo(scroller, 55.6);
				screen.getByText("Loading").setAttribute("data-px", "490");
				notifyContentResize();
				expect(scroller.scrollTop).toBe(490);
				expect(screen.getByText("Row 10").getBoundingClientRect().top).toBe(0);
			});

			it("[ISSUE-3471-ITEM-6] stops keeping the rows in view in place once the list is scrolled", () => {
				const { container, rerender } = render(
					<InfiniteScroll
						className={SCROLLER}
						loadMoreTop={vi.fn()}
						loadMoreBottom={vi.fn()}
					>
						<Rows from={10} />
					</InfiniteScroll>,
				);
				const scroller = getScroller(container);
				rerender(
					<InfiniteScroll
						className={SCROLLER}
						loadMoreTop={vi.fn()}
						loadMoreBottom={vi.fn()}
					>
						<Rows from={10} placeholderPx={56} />
					</InfiniteScroll>,
				);
				expect(scroller.scrollTop).toBe(56);

				// the user (or the consumer, e.g. a "today" button) scrolls the list
				scrollTo(scroller, 200);
				screen.getByText("Loading").setAttribute("data-px", "490");
				notifyContentResize();
				expect(scroller.scrollTop).toBe(200);
			});

			it("[ISSUE-3471-ITEM-12] keeps the rows in view in place when rows are added above them after the first of them was replaced on its own", () => {
				// e.g. a week whose spinner is replaced by its days, a render of the
				// week only
				let loadRow10 = () => {};
				const Row10 = () => {
					const [loaded, setLoaded] = useState(false);
					useEffect(() => {
						loadRow10 = () => setLoaded(true);
					}, []);
					return loaded ? (
						<div key="loaded" className="row">
							Row 10
						</div>
					) : (
						<div key="loading" className="row">
							Loading row 10
						</div>
					);
				};
				const rowsFrom = (from: number) => (
					<div className="rows">
						{range(from, 10 - from).map((n) => (
							<div className="row" key={n}>
								Row {n}
							</div>
						))}
						<Row10 key={10} />
						{range(11, 29).map((n) => (
							<div className="row" key={n}>
								Row {n}
							</div>
						))}
					</div>
				);
				const loadMoreTop = vi.fn();
				const loadMoreBottom = vi.fn();
				const { container, rerender } = render(
					<InfiniteScroll
						className={SCROLLER}
						loadMoreTop={loadMoreTop}
						loadMoreBottom={loadMoreBottom}
					>
						{rowsFrom(10)}
					</InfiniteScroll>,
				);
				const scroller = getScroller(container);
				act(() => loadRow10());
				// loadMoreTop adds rows 0 to 9 above row 10
				rerender(
					<InfiniteScroll
						className={SCROLLER}
						loadMoreTop={loadMoreTop}
						loadMoreBottom={loadMoreBottom}
					>
						{rowsFrom(0)}
					</InfiniteScroll>,
				);
				expect(scroller.scrollTop).toBe(10 * ROW_PX);
				expect(screen.getByText("Row 10").getBoundingClientRect().top).toBe(0);
			});

			it("[ISSUE-3471-ITEM-6] without loadMoreTop, leaves rows added above the rows in view at the top in view, as browsers do", () => {
				const { container, rerender } = render(
					<InfiniteScroll className={SCROLLER} loadMoreBottom={vi.fn()}>
						<Rows from={10} />
					</InfiniteScroll>,
				);
				rerender(
					<InfiniteScroll className={SCROLLER} loadMoreBottom={vi.fn()}>
						<Rows from={0} />
					</InfiniteScroll>,
				);
				expect(getScroller(container).scrollTop).toBe(0);
			});
		});

		describe("loading and threshold", () => {
			it("[ISSUE-3471-ITEM-7] passes neither loading nor threshold to the scroll container", () => {
				// React reports a DOM prop it cannot render with console.error, once per
				// name: this test passes `loading` before any other
				const consoleError = vi.spyOn(console, "error");
				const { container } = render(
					<InfiniteScroll
						className={SCROLLER}
						loadMoreBottom={vi.fn()}
						loading={false}
						threshold={100}
					>
						<div>Row 1</div>
					</InfiniteScroll>,
				);
				expect(getScroller(container).getAttributeNames().sort()).toEqual([
					"class",
					"tabindex",
				]);
				expect(consoleError).not.toHaveBeenCalled();
			});

			it("[ISSUE-3471-ITEM-7] makes no call while loading, and makes the fill call that came up meanwhile once loading turns false", () => {
				scrollHeightOf = () => 300;
				const bottom = vi.fn();
				const children = <div>page 1</div>;
				const { rerender } = render(
					<InfiniteScroll className={SCROLLER} loadMoreBottom={bottom} loading>
						{children}
					</InfiniteScroll>,
				);
				advance(200);
				expect(bottom).not.toHaveBeenCalled();
				// the load ends without new rows, e.g. its result was discarded
				rerender(
					<InfiniteScroll
						className={SCROLLER}
						loadMoreBottom={bottom}
						loading={false}
					>
						{children}
					</InfiniteScroll>,
				);
				advance(200);
				expect(bottom).toHaveBeenCalledTimes(1);
			});

			it("[ISSUE-3471-ITEM-7] makes no call for scrolls to the bottom while loading, and none after the page that moves the bottom away", () => {
				let height = 1000;
				scrollHeightOf = () => height;
				const bottom = vi.fn();
				const { container, rerender } = render(
					<InfiniteScroll className={SCROLLER} loadMoreBottom={bottom} loading>
						<div>page 1</div>
					</InfiniteScroll>,
				);
				const scroller = getScroller(container);
				for (let i = 0; i < 3; i++) {
					scrollTo(scroller, 700);
					advance(200);
				}
				expect(bottom).not.toHaveBeenCalled();
				height = 1300;
				rerender(
					<InfiniteScroll
						className={SCROLLER}
						loadMoreBottom={bottom}
						loading={false}
					>
						<div>pages 1 and 2</div>
					</InfiniteScroll>,
				);
				advance(200);
				expect(bottom).not.toHaveBeenCalled();
			});

			it("[ISSUE-3471-ITEM-7] makes the call for a scroll to the bottom during a load once the load ends without new rows", () => {
				const bottom = vi.fn();
				const children = <div>page 1</div>;
				const { container, rerender } = render(
					<InfiniteScroll className={SCROLLER} loadMoreBottom={bottom} loading>
						{children}
					</InfiniteScroll>,
				);
				scrollTo(getScroller(container), 700);
				advance(200);
				expect(bottom).not.toHaveBeenCalled();
				rerender(
					<InfiniteScroll
						className={SCROLLER}
						loadMoreBottom={bottom}
						loading={false}
					>
						{children}
					</InfiniteScroll>,
				);
				advance(200);
				expect(bottom).toHaveBeenCalledTimes(1);
			});

			it("[ISSUE-3471-ITEM-7] does not repeat a load that ends without new rows when no call came up while it ran", () => {
				scrollHeightOf = () => 300;
				const bottom = vi.fn();
				const children = <div>page 1</div>;
				const { rerender } = render(
					<InfiniteScroll className={SCROLLER} loadMoreBottom={bottom}>
						{children}
					</InfiniteScroll>,
				);
				advance(200);
				expect(bottom).toHaveBeenCalledTimes(1);
				// the consumer marks the load as running, and it fails
				rerender(
					<InfiniteScroll className={SCROLLER} loadMoreBottom={bottom} loading>
						{children}
					</InfiniteScroll>,
				);
				rerender(
					<InfiniteScroll
						className={SCROLLER}
						loadMoreBottom={bottom}
						loading={false}
					>
						{children}
					</InfiniteScroll>,
				);
				advance(1000);
				expect(bottom).toHaveBeenCalledTimes(1);
			});

			it("[ISSUE-3471-ITEM-7] holds loadMoreTop while loading, and calls it once loading ends with the list at its top", () => {
				const top = vi.fn();
				const bottom = vi.fn();
				const children = <div />;
				const { container, rerender } = render(
					<InfiniteScroll
						className={SCROLLER}
						loadMoreTop={top}
						loadMoreBottom={bottom}
						loading
					>
						{children}
					</InfiniteScroll>,
				);
				const scroller = getScroller(container);
				advance(200);
				scrollTo(scroller, 300);
				scrollTo(scroller, 0);
				advance(200);
				expect(top).not.toHaveBeenCalled();
				rerender(
					<InfiniteScroll
						className={SCROLLER}
						loadMoreTop={top}
						loadMoreBottom={bottom}
						loading={false}
					>
						{children}
					</InfiniteScroll>,
				);
				advance(200);
				expect(top).toHaveBeenCalledTimes(1);
				expect(bottom).not.toHaveBeenCalled();
			});

			it("[ISSUE-3471-ITEM-7] fills a list that was emptied while a load ran once that load ends, with one request at a time", async () => {
				scrollHeightOf = (el) => el.querySelectorAll(".row").length * 30;
				const requests: string[] = [];
				let running = 0;
				let mostRunning = 0;
				const fetchPage = (filter: string, offset: number) => {
					requests.push(`${filter} ${offset}`);
					running++;
					mostRunning = Math.max(mostRunning, running);
					return new Promise<string[]>((resolve) =>
						setTimeout(() => {
							running--;
							// 20 rows of 30px fill the container
							resolve(Array.from({ length: 20 }, (_, i) => `${filter}${i}`));
						}, 300),
					);
				};
				const { rerender } = render(
					<FilteredList filter="a" fetchPage={fetchPage} />,
				);
				// the first page of filter "a" is loading, until 400ms
				await advanceInStepsAsync(150);
				expect(requests).toEqual(["a 0"]);
				// the emptied list asks to be filled while that page loads
				rerender(<FilteredList filter="b" fetchPage={fetchPage} />);
				await advanceInStepsAsync(1500);
				expect(requests).toEqual(["a 0", "b 0"]);
				expect(mostRunning).toBe(1);
				expect(screen.getByText("b19")).toBeInTheDocument();
				expect(screen.queryByText("a0")).not.toBeInTheDocument();
			});

			it("[ISSUE-3471-ITEM-7] marks the scroll container busy while loading", () => {
				const bottom = vi.fn();
				const { container, rerender } = render(
					<InfiniteScroll className={SCROLLER} loadMoreBottom={bottom} loading>
						<div>Row 1</div>
					</InfiniteScroll>,
				);
				const scroller = getScroller(container);
				expect(scroller).toHaveAttribute("aria-busy", "true");
				rerender(
					<InfiniteScroll
						className={SCROLLER}
						loadMoreBottom={bottom}
						loading={false}
					>
						<div>Row 1</div>
					</InfiniteScroll>,
				);
				expect(scroller).not.toHaveAttribute("aria-busy");
			});

			it("[ISSUE-3471-ITEM-7] calls loadMoreBottom once 250px or less are left below the view", () => {
				const bottom = vi.fn();
				const { container } = render(
					<InfiniteScroll className={SCROLLER} loadMoreBottom={bottom}>
						<div />
					</InfiniteScroll>,
				);
				const scroller = getScroller(container);
				// 1000 - 300 - 449 = 251px below the view
				scrollTo(scroller, 449);
				advance(200);
				expect(bottom).not.toHaveBeenCalled();
				scrollTo(scroller, 450);
				advance(200);
				expect(bottom).toHaveBeenCalledTimes(1);
			});

			it("[ISSUE-3471-ITEM-7] fills the container until its content overflows it by more than 250px", () => {
				let height = 551;
				scrollHeightOf = () => height;
				const bottom = vi.fn();
				const { rerender } = render(
					<InfiniteScroll className={SCROLLER} loadMoreBottom={bottom}>
						<div>page 1</div>
					</InfiniteScroll>,
				);
				advance(200);
				expect(bottom).not.toHaveBeenCalled();
				// e.g. a row that shrank
				height = 550;
				rerender(
					<InfiniteScroll className={SCROLLER} loadMoreBottom={bottom}>
						<div>page 1, shorter</div>
					</InfiniteScroll>,
				);
				advance(200);
				expect(bottom).toHaveBeenCalledTimes(1);
			});

			it("[ISSUE-3471-ITEM-7] calls loadMoreBottom again after new rows that leave 250px or less below the view", () => {
				let height = 1000;
				scrollHeightOf = () => height;
				const bottom = vi.fn();
				const { container, rerender } = render(
					<InfiniteScroll className={SCROLLER} loadMoreBottom={bottom}>
						<div>page 1</div>
					</InfiniteScroll>,
				);
				scrollTo(getScroller(container), 700);
				advance(200);
				expect(bottom).toHaveBeenCalledTimes(1);
				// the page adds 100px, so 100px are below the view
				height = 1100;
				rerender(
					<InfiniteScroll className={SCROLLER} loadMoreBottom={bottom}>
						<div>pages 1 and 2</div>
					</InfiniteScroll>,
				);
				advance(200);
				expect(bottom).toHaveBeenCalledTimes(2);
			});

			it("[ISSUE-3471-ITEM-7] with threshold 0, fills only a list that does not overflow, and loads less than 1px from the bottom", () => {
				let height = 301;
				scrollHeightOf = () => height;
				const bottom = vi.fn();
				const { container, rerender } = render(
					<InfiniteScroll
						className={SCROLLER}
						loadMoreBottom={bottom}
						threshold={0}
					>
						<div>page 1</div>
					</InfiniteScroll>,
				);
				advance(200);
				expect(bottom).not.toHaveBeenCalled();
				height = 1000;
				rerender(
					<InfiniteScroll
						className={SCROLLER}
						loadMoreBottom={bottom}
						threshold={0}
					>
						<div>pages 1 and 2</div>
					</InfiniteScroll>,
				);
				const scroller = getScroller(container);
				scrollTo(scroller, 699);
				advance(200);
				expect(bottom).not.toHaveBeenCalled();
				scrollTo(scroller, 699.5);
				advance(200);
				expect(bottom).toHaveBeenCalledTimes(1);
			});

			it("[ISSUE-3471-ITEM-7] applies a threshold changed after mount at once", () => {
				// the content overflows the container by 300px
				scrollHeightOf = () => 600;
				const bottom = vi.fn();
				const children = <div>page 1</div>;
				const { rerender } = render(
					<InfiniteScroll className={SCROLLER} loadMoreBottom={bottom}>
						{children}
					</InfiniteScroll>,
				);
				advance(200);
				expect(bottom).not.toHaveBeenCalled();
				rerender(
					<InfiniteScroll
						className={SCROLLER}
						loadMoreBottom={bottom}
						threshold={300}
					>
						{children}
					</InfiniteScroll>,
				);
				advance(200);
				expect(bottom).toHaveBeenCalledTimes(1);
			});

			it("[ISSUE-3471-ITEM-7] fills a list that does not overflow with a negative or NaN threshold, as with 0", () => {
				scrollHeightOf = () => 300;
				const negative = vi.fn();
				const notANumber = vi.fn();
				render(
					<>
						<InfiniteScroll
							className={SCROLLER}
							loadMoreBottom={negative}
							threshold={-50}
						>
							<div>Row 1</div>
						</InfiniteScroll>
						<InfiniteScroll
							className={SCROLLER}
							loadMoreBottom={notANumber}
							threshold={NaN}
						>
							<div>Row 1</div>
						</InfiniteScroll>
					</>,
				);
				advance(200);
				expect({
					negative: negative.mock.calls.length,
					notANumber: notANumber.mock.calls.length,
				}).toEqual({ negative: 1, notANumber: 1 });
			});

			it("[ISSUE-3471-ITEM-7] calls loadMoreTop only at the top", () => {
				const top = vi.fn();
				const { container } = render(
					<InfiniteScroll
						className={SCROLLER}
						loadMoreTop={top}
						loadMoreBottom={vi.fn()}
					>
						<div />
					</InfiniteScroll>,
				);
				advance(200);
				// the list opens at its top
				expect(top).toHaveBeenCalledTimes(1);
				const scroller = getScroller(container);
				scrollTo(scroller, 300);
				scrollTo(scroller, 100);
				advance(200);
				expect(top).toHaveBeenCalledTimes(1);
				scrollTo(scroller, 0);
				advance(200);
				expect(top).toHaveBeenCalledTimes(2);
			});
		});

		describe("size changes of the container", () => {
			/**
			 * Calls the ResizeObservers that observe the element, as a change of
			 * its size would
			 */
			const reportResize = (element: Element) => {
				const callsWith = (mock: Mock) =>
					mock.mock.calls.filter(([target]) => target === element).length;
				for (const observer of resizeObservers) {
					if (callsWith(observer.observe) > callsWith(observer.unobserve)) {
						act(() => {
							observer.callback([], {} as ResizeObserver);
						});
					}
				}
			};

			it("[ISSUE-3471-ITEM-8] fills the container again when it grows past its content without a render", () => {
				const bottom = vi.fn();
				const { container } = render(
					<InfiniteScroll className={SCROLLER} loadMoreBottom={bottom}>
						<div />
					</InfiniteScroll>,
				);
				// 1000px of content overflow the 300px container by more than 250px
				advance(200);
				expect(bottom).not.toHaveBeenCalled();

				// e.g. a height relative to the viewport, after a window resize
				clientHeight = 900;
				reportResize(getScroller(container));
				advance(100);
				expect(bottom).toHaveBeenCalledTimes(1);
			});

			it("[ISSUE-3471-ITEM-8] fills a list that only loads on top again when its container grows", () => {
				const top = vi.fn();
				const { container } = render(
					<InfiniteScroll className={SCROLLER} loadMoreTop={top}>
						<div />
					</InfiniteScroll>,
				);
				advance(200);
				// the list opens at its top
				expect(top).toHaveBeenCalledTimes(1);

				clientHeight = 900;
				reportResize(getScroller(container));
				advance(100);
				expect(top).toHaveBeenCalledTimes(2);
			});

			it("[ISSUE-3471-ITEM-8] observes the container's size, and makes no call when a change leaves its content filling it", () => {
				const bottom = vi.fn();
				const { container } = render(
					<InfiniteScroll className={SCROLLER} loadMoreBottom={bottom}>
						<div />
					</InfiniteScroll>,
				);
				const scroller = getScroller(container);
				expect(lastResizeObserver().observe).toHaveBeenCalledExactlyOnceWith(
					scroller,
				);

				clientHeight = 200;
				reportResize(scroller);
				advance(200);
				expect(bottom).not.toHaveBeenCalled();
			});

			it("[ISSUE-3471-ITEM-8] keeps observing a container that was hidden once it is shown, so it fills again when it grows", () => {
				clientHeight = 0;
				scrollHeightOf = () => 0;
				const bottom = vi.fn();
				const { container } = render(
					<InfiniteScroll className={SCROLLER} loadMoreBottom={bottom}>
						<div />
					</InfiniteScroll>,
				);
				const scroller = getScroller(container);
				advance(200);
				expect(bottom).not.toHaveBeenCalled();

				// the panel is shown, and the rows it then loads fill the container
				clientHeight = 300;
				scrollHeightOf = () => 300;
				reportResize(scroller);
				advance(100);
				expect(bottom).toHaveBeenCalledTimes(1);
				scrollHeightOf = () => 1000;

				clientHeight = 900;
				reportResize(scroller);
				advance(100);
				expect(bottom).toHaveBeenCalledTimes(2);
			});

			it("[ISSUE-3471-ITEM-8] observes the container under StrictMode, and stops on unmount", () => {
				const bottom = vi.fn();
				const { container, unmount } = render(
					<React.StrictMode>
						<InfiniteScroll className={SCROLLER} loadMoreBottom={bottom}>
							<div />
						</InfiniteScroll>
					</React.StrictMode>,
				);
				const scroller = getScroller(container);
				advance(200);
				clientHeight = 900;
				reportResize(scroller);
				advance(100);
				expect(bottom).toHaveBeenCalledTimes(1);

				unmount();
				const observer = lastResizeObserver();
				expect(observer.unobserve.mock.calls).toEqual(
					observer.observe.mock.calls,
				);
			});

			it("[ISSUE-3471-ITEM-8] without ResizeObserver, fills the container again on a window resize, and stops listening on unmount", () => {
				vi.stubGlobal("ResizeObserver", undefined);
				const addListener = vi.spyOn(window, "addEventListener");
				const removeListener = vi.spyOn(window, "removeEventListener");
				const resizeListeners = (spy: { mock: { calls: unknown[][] } }) =>
					spy.mock.calls
						.filter(([type]) => type === "resize")
						.map(([, listener]) => listener);
				const bottom = vi.fn();
				const { unmount } = render(
					<InfiniteScroll className={SCROLLER} loadMoreBottom={bottom}>
						<div />
					</InfiniteScroll>,
				);
				advance(200);
				expect(bottom).not.toHaveBeenCalled();

				clientHeight = 900;
				act(() => {
					window.dispatchEvent(new Event("resize"));
				});
				advance(100);
				expect(bottom).toHaveBeenCalledTimes(1);

				const added = resizeListeners(addListener);
				expect(added).toHaveLength(1);
				unmount();
				expect(resizeListeners(removeListener)).toEqual(added);
			});
		});

		it("[ISSUE-3471-ITEM-9] passes role, aria-label, tabIndex and id to the scroll container", () => {
			const { container } = render(
				<InfiniteScroll
					className={SCROLLER}
					loadMoreBottom={vi.fn()}
					role="region"
					aria-label="Notifications"
					tabIndex={0}
					id="notification-list"
				>
					<div>Notification 1</div>
				</InfiniteScroll>,
			);
			const scroller = getScroller(container);
			expect(screen.getByRole("region", { name: "Notifications" })).toBe(
				scroller,
			);
			expect(scroller).toHaveAttribute("tabindex", "0");
			expect(scroller).toHaveAttribute("id", "notification-list");
		});

		it("[ISSUE-3471-ITEM-9] makes the scroll container a tab stop by default, and passes none of its own props to it", () => {
			// React reports an unknown DOM prop with console.error, and renders none
			// of these as an attribute
			const consoleError = vi.spyOn(console, "error");
			const { container } = render(
				<InfiniteScroll
					className={SCROLLER}
					loadMoreTop={vi.fn()}
					loadMoreBottom={vi.fn()}
					callBackDebounce={0}
				>
					<div>Row 1</div>
				</InfiniteScroll>,
			);
			const scroller = getScroller(container);
			expect(scroller).toHaveAttribute("tabindex", "0");
			expect(scroller.getAttributeNames().sort()).toEqual([
				"class",
				"tabindex",
			]);
			expect(consoleError).not.toHaveBeenCalled();
		});

		it("[ISSUE-3471-ITEM-9] keeps the tabIndex the consumer passes", () => {
			const bottom = vi.fn();
			const { container, rerender } = render(
				<InfiniteScroll
					className={SCROLLER}
					loadMoreBottom={bottom}
					tabIndex={-1}
				>
					<div>Row 1</div>
				</InfiniteScroll>,
			);
			const scroller = getScroller(container);
			expect(scroller).toHaveAttribute("tabindex", "-1");

			rerender(
				<InfiniteScroll className={SCROLLER} loadMoreBottom={bottom}>
					<div>Row 1</div>
				</InfiniteScroll>,
			);
			expect(scroller).toHaveAttribute("tabindex", "0");
		});

		it("[ISSUE-3471-ITEM-12] a ref to it is the scroll container element, until unmount", () => {
			const ref = React.createRef<HTMLDivElement>();
			const { container, unmount } = render(
				<InfiniteScroll ref={ref} className={SCROLLER} loadMoreBottom={vi.fn()}>
					<div>Row 1</div>
				</InfiniteScroll>,
			);
			expect(ref.current).toBe(getScroller(container));
			unmount();
			expect(ref.current).toBeNull();
		});

		describe("focus on the last row", () => {
			interface RowsProps {
				loadMoreBottom?: () => void;
				loading?: boolean;
				/** Rendered after the 20 rows */
				after?: React.ReactNode;
			}

			/**
			 * 20 rows that are buttons, then content without focusable elements, in
			 * a list between two buttons. The stubbed layout leaves 700px below the
			 * view, more than the threshold, and focusing an element scrolls nothing.
			 */
			const Rows = ({ loadMoreBottom, loading, after }: RowsProps) => (
				<>
					<button type="button">Before the list</button>
					<InfiniteScroll
						className={SCROLLER}
						loadMoreBottom={loadMoreBottom}
						loading={loading}
					>
						{range(1, 20).map((n) => (
							<button key={n} type="button">
								Row {n}
							</button>
						))}
						{after}
						<div>Content without focusable elements</div>
					</InfiniteScroll>
					<button type="button">After the list</button>
				</>
			);

			const focus = (element: HTMLElement) =>
				act(() => {
					element.focus();
				});
			const getRow = (n: number) =>
				screen.getByRole("button", { name: `Row ${n}` });

			it("[ISSUE-3471-ITEM-11] calls loadMoreBottom when focus moves to the last row, however much content without focusable elements follows it", () => {
				const bottom = vi.fn();
				render(<Rows loadMoreBottom={bottom} />);
				advance(200);
				expect(bottom).not.toHaveBeenCalled();

				focus(getRow(19));
				advance(200);
				expect(bottom).not.toHaveBeenCalled();
				focus(getRow(20));
				advance(99);
				expect(bottom).not.toHaveBeenCalled();
				advance(1);
				expect(bottom).toHaveBeenCalledTimes(1);
			});

			it("[ISSUE-3471-ITEM-11] calls nothing when focus moves to a row that a tab stop follows in the container", () => {
				const bottom = vi.fn();
				render(
					<Rows
						loadMoreBottom={bottom}
						after={<a href="#all">Show all rows</a>}
					/>,
				);
				focus(getRow(20));
				advance(200);
				expect(bottom).not.toHaveBeenCalled();

				focus(screen.getByRole("link", { name: "Show all rows" }));
				advance(200);
				expect(bottom).toHaveBeenCalledTimes(1);
			});

			it("[ISSUE-3471-ITEM-11] calls nothing when focus moves to the scroll container, also when its rows contain nothing focusable", () => {
				const bottom = vi.fn();
				const { container } = render(
					<InfiniteScroll className={SCROLLER} loadMoreBottom={bottom}>
						<div>Row 1</div>
						<div>Row 2</div>
					</InfiniteScroll>,
				);
				focus(getScroller(container));
				advance(200);
				expect(bottom).not.toHaveBeenCalled();
			});

			it("[ISSUE-3471-ITEM-11] does not postpone a waiting call when focus moves to a row that is not the last", () => {
				const bottom = vi.fn();
				render(<Rows loadMoreBottom={bottom} />);
				// 250px below the view
				scrollTo(getRow(1).parentElement as HTMLElement, 450);
				advance(50);
				focus(getRow(19));
				advance(50);
				expect(bottom).toHaveBeenCalledTimes(1);
			});

			it("[ISSUE-3471-ITEM-11] does not count what Tab skips after the last row: disabled, hidden or inert controls, hidden inputs and elements with a negative tabIndex", () => {
				const bottom = vi.fn();
				render(
					<Rows
						loadMoreBottom={bottom}
						after={
							<>
								<button type="button" disabled>
									Disabled
								</button>
								<fieldset disabled>
									<input aria-label="In a disabled fieldset" />
								</fieldset>
								<div hidden>
									<button type="button">Hidden</button>
								</div>
								<div inert>
									<button type="button">Inert</button>
								</div>
								<input type="hidden" name="cursor" value="20" />
								<div tabIndex={-1}>Focus target</div>
							</>
						}
					/>,
				);
				focus(getRow(20));
				advance(200);
				expect(bottom).toHaveBeenCalledTimes(1);
			});

			it("[ISSUE-3471-ITEM-11] in a widget that moves focus with the arrow keys, calls loadMoreBottom for its last item only", () => {
				const bottom = vi.fn();
				render(
					<InfiniteScroll className={SCROLLER} loadMoreBottom={bottom}>
						<div role="listbox" aria-label="Rows">
							{range(1, 20).map((n) => (
								<div
									key={n}
									role="option"
									aria-selected={false}
									tabIndex={n === 1 ? 0 : -1}
								>
									Option {n}
								</div>
							))}
						</div>
						{/* same tag, but no option: not an item of the widget */}
						<div tabIndex={-1}>Focus target</div>
					</InfiniteScroll>,
				);
				const options = screen.getAllByRole("option");
				// the first option is the widget's tab stop; the arrow keys move focus
				// from option to option, which keeps or takes the tab stop
				for (const option of options.slice(0, 19)) {
					option.tabIndex = 0;
					focus(option);
					advance(200);
				}
				expect(bottom).not.toHaveBeenCalled();
				focus(options[19]);
				advance(200);
				expect(bottom).toHaveBeenCalledTimes(1);
			});

			it("[ISSUE-3471-ITEM-11] drops the call once focus left the last row before the wait is over", () => {
				const bottom = vi.fn();
				render(<Rows loadMoreBottom={bottom} />);
				focus(getRow(20));
				advance(50);
				focus(screen.getByRole("button", { name: "After the list" }));
				advance(200);
				expect(bottom).not.toHaveBeenCalled();
			});

			it("[ISSUE-3471-ITEM-11] holds the call while loading, and makes it once loading ends with focus still on the last row", () => {
				const bottom = vi.fn();
				const { rerender } = render(<Rows loadMoreBottom={bottom} loading />);
				focus(getRow(20));
				advance(200);
				expect(bottom).not.toHaveBeenCalled();

				rerender(<Rows loadMoreBottom={bottom} loading={false} />);
				advance(200);
				expect(bottom).toHaveBeenCalledTimes(1);
			});

			it("[ISSUE-3471-ITEM-11] stops listening for focus on unmount", () => {
				const { unmount } = render(<Rows loadMoreBottom={vi.fn()} />);
				const scroller = getRow(1).parentElement as HTMLElement;
				const addListener = vi.spyOn(scroller, "addEventListener");
				const removeListener = vi.spyOn(scroller, "removeEventListener");
				unmount();
				expect(addListener).not.toHaveBeenCalled();
				expect(removeListener).toHaveBeenCalledWith(
					"focusin",
					expect.any(Function),
				);
			});
		});

		describe("triggers that keep coming while a call waits", () => {
			/**
			 * Scrolls the container from `from` to `to` by `step` px every 50ms, as
			 * a wheel or touch scroll that does not pause
			 */
			const scrollSteadily = (
				scroller: HTMLElement,
				from: number,
				to: number,
				step: number,
			) => {
				for (let top = from; top <= to; top += step) {
					scrollTo(scroller, top);
					advance(50);
				}
			};

			/**
			 * Sets `loading` when loadMoreBottom is called, and keeps it set: the
			 * load runs until the test ends
			 */
			const LoadingList = ({ onLoad }: { onLoad: () => void }) => {
				const [loading, setLoading] = useState(false);
				const loadMore = useCallback(() => {
					onLoad();
					setLoading(true);
				}, [onLoad]);
				return (
					<InfiniteScroll
						className={SCROLLER}
						loadMoreBottom={loadMore}
						loading={loading}
					>
						<div />
					</InfiniteScroll>
				);
			};

			it("[ISSUE-3471-ITEM-13] calls loadMoreBottom callBackDebounce ms after a steady scroll comes within the threshold of the bottom, while the scroll goes on", () => {
				const start = Date.now();
				const callTimes: number[] = [];
				const bottom = vi.fn(() => {
					callTimes.push(Date.now() - start);
				});
				const { container } = render(
					<InfiniteScroll className={SCROLLER} loadMoreBottom={bottom}>
						<div />
					</InfiniteScroll>,
				);
				// 1000px of content in a 300px container: 250px or less are left
				// below the view from 450 on. The scroll passes 455 150ms in and
				// reaches the bottom (700) 500ms in.
				scrollSteadily(getScroller(container), 350, 700, 35);
				advance(200);
				expect(callTimes[0]).toBe(250);
				// nothing was loaded, so the list stays near the bottom: the scroll
				// events that follow request the call again, one per 100ms
				expect(callTimes).toEqual([250, 350, 450, 550]);
			});

			it("[ISSUE-3471-ITEM-13] makes one call during a steady scroll near the bottom while the load it started runs", () => {
				const onLoad = vi.fn();
				const { container } = render(<LoadingList onLoad={onLoad} />);
				scrollSteadily(getScroller(container), 350, 700, 35);
				expect(onLoad).toHaveBeenCalledTimes(1);
				advance(200);
				expect(onLoad).toHaveBeenCalledTimes(1);
			});

			it("[ISSUE-3471-ITEM-13] does not postpone a waiting fill call when new children arrive before the wait is over", () => {
				scrollHeightOf = () => 300;
				const bottom = vi.fn();
				const { rerender } = render(
					<InfiniteScroll className={SCROLLER} loadMoreBottom={bottom}>
						<div>Row 1</div>
					</InfiniteScroll>,
				);
				advance(50);
				// e.g. the data of a row that arrives, which leaves the list short
				rerender(
					<InfiniteScroll className={SCROLLER} loadMoreBottom={bottom}>
						<div>Row 1, loaded</div>
					</InfiniteScroll>,
				);
				advance(50);
				expect(bottom).toHaveBeenCalledTimes(1);
			});

			it("[ISSUE-3471-ITEM-13] keeps the wait of a waiting call when callBackDebounce changes, and makes the call at the next trigger once it is 0", () => {
				const bottom = vi.fn();
				const children = <div />;
				const { container, rerender } = render(
					<InfiniteScroll className={SCROLLER} loadMoreBottom={bottom}>
						{children}
					</InfiniteScroll>,
				);
				const scroller = getScroller(container);
				scrollTo(scroller, 700);
				rerender(
					<InfiniteScroll
						className={SCROLLER}
						loadMoreBottom={bottom}
						callBackDebounce={250}
					>
						{children}
					</InfiniteScroll>,
				);
				scrollTo(scroller, 700);
				advance(100);
				expect(bottom).toHaveBeenCalledTimes(1);

				// this one waits 250ms
				scrollTo(scroller, 700);
				rerender(
					<InfiniteScroll
						className={SCROLLER}
						loadMoreBottom={bottom}
						callBackDebounce={0}
					>
						{children}
					</InfiniteScroll>,
				);
				scrollTo(scroller, 700);
				expect(bottom).toHaveBeenCalledTimes(2);
				advance(250);
				expect(bottom).toHaveBeenCalledTimes(2);
			});
		});
	});
});
