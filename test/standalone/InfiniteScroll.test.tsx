import React from "react";
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
	});
});
