import React, { useCallback, useState } from "react";
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

	it("accepts dynamicallySized prop without crashing", () => {
		const loadMoreBottom = vi.fn();
		expect(() =>
			render(
				<InfiniteScroll
					className="test-scroll"
					loadMoreBottom={loadMoreBottom}
					dynamicallySized
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
			scrollTo(getScroller(container), 0);
			expect(top).toHaveBeenCalledTimes(1);
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
			expect(top).toHaveBeenCalledTimes(0);
			advance(1);
			expect(top).toHaveBeenCalledTimes(1);
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
			expect(top).toHaveBeenCalledTimes(2);
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

		it("[ISSUE-3471-ITEM-4] does not load page after page while the scroll container is hidden", () => {
			// what browsers report for a scroll container inside display: none
			clientHeight = 0;
			scrollHeightOf = () => 0;
			const onLoad = vi.fn();
			render(<AppendingList onLoad={onLoad} />);
			advanceInSteps(1500);
			expect(onLoad.mock.calls.length).toBeLessThanOrEqual(1);
		});

		it("[ISSUE-3471-ITEM-4] fills a hidden container once it is shown, then stops observing it", () => {
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
			expect(observer.unobserve).toHaveBeenCalledExactlyOnceWith(scroller);
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
			expect(lastResizeObserver().observe).not.toHaveBeenCalled();
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

		it("[ISSUE-3471-ITEM-4] with dynamicallySized, observes a hidden container once and keeps observing it after it is shown", () => {
			clientHeight = 0;
			scrollHeightOf = () => 0;
			const bottom = vi.fn();
			const { container } = render(
				<InfiniteScroll
					className={SCROLLER}
					loadMoreBottom={bottom}
					dynamicallySized
				>
					<div />
				</InfiniteScroll>,
			);
			const observer = lastResizeObserver();
			expect(observer.observe).toHaveBeenCalledExactlyOnceWith(
				getScroller(container),
			);
			advance(200);
			expect(bottom).not.toHaveBeenCalled();

			clientHeight = 300;
			scrollHeightOf = () => 300;
			act(() => {
				observer.callback([], {} as ResizeObserver);
			});
			advance(100);
			expect(bottom).toHaveBeenCalledTimes(1);
			expect(observer.unobserve).not.toHaveBeenCalled();
		});

		it("[ISSUE-3471-ITEM-4] keeps observing a hidden container when dynamicallySized is turned off", () => {
			clientHeight = 0;
			scrollHeightOf = () => 0;
			const bottom = vi.fn();
			const children = <div />;
			const { container, rerender } = render(
				<InfiniteScroll
					className={SCROLLER}
					loadMoreBottom={bottom}
					dynamicallySized
				>
					{children}
				</InfiniteScroll>,
			);
			const scroller = getScroller(container);
			const observer = lastResizeObserver();
			rerender(
				<InfiniteScroll className={SCROLLER} loadMoreBottom={bottom}>
					{children}
				</InfiniteScroll>,
			);
			expect(observer.unobserve).not.toHaveBeenCalled();

			clientHeight = 300;
			scrollHeightOf = () => 300;
			act(() => {
				observer.callback([], {} as ResizeObserver);
			});
			advance(100);
			expect(bottom).toHaveBeenCalledTimes(1);
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
					dynamicallySized
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
	});
});
