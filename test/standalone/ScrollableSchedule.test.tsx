import React, { useCallback } from "react";
import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import moment from "moment";
import ccI18n from "../../src/i18n";
import ScrollableSchedule from "../../src/standalone/Schedule/Scrollable";
import type { LoadWeekCallback } from "../../src/standalone/Schedule/Scrollable";
import type {
	IDayData,
	ScheduleFilterDefinition,
} from "../../src/standalone/Schedule/Common/DayContents";

// ScrollableSchedule with its weeks (ScrollableScheduleWeek), day rows
// (ScrollableScheduleDay), and the shared DayContents / ScheduleFilterRenderer
// as this view wires them. Fake timers drive InfiniteScroll's 100ms debounce,
// MUI transitions and Date; findBy*/waitFor are not used with them.

// ─── Harness ──────────────────────────────────────────────────────────────────
// jsdom has no layout. Elements with class SCROLLER get clientHeight 300 and a
// scrollHeight computed from the weeks in the list: a loaded week (its
// "Week N, …" label) counts WEEK_PX, so InfiniteScroll's fill check loads
// exactly weeks 0 and 1. A pending week (spinner) and a failed week (one text
// line) count WEEK_PX too, unless a test sets geometry.pendingPx/errorPx to the
// heights they have in a browser. scrollTop is writable per element. Today's
// day label (the jumpToToday target) reports offsetTop TODAY_TOP.
const SCROLLER = "sched";
const WEEK_PX = 200;
const TODAY_TOP = 777;
const geometry = { pendingPx: WEEK_PX, errorPx: WEEK_PX };
const saved = new Map<string, PropertyDescriptor | undefined>();
const scrollTops = new WeakMap<Element, number>();

const isWeekLabel = (text: string) => /^(Week|Woche) \d+, /.test(text);

/** content height of the scroller: per week in the list, by its state */
const listHeight = (scroller: Element) => {
	const list = scroller.querySelector(".MuiGrid-container");
	if (!list) return 0;
	let height = 0;
	for (const child of Array.from(list.children)) {
		const text = child.textContent ?? "";
		if (child.querySelector(".MuiCircularProgress-root"))
			height += geometry.pendingPx;
		else if (child.childElementCount === 0 && text !== "")
			height += isWeekLabel(text) ? WEEK_PX : geometry.errorPx;
	}
	return height;
};

// a side-effect import of a moment locale has no type declarations (TS2882)
const MOMENT_DE = "moment/locale/de";
beforeAll(async () => {
	await import(/* @vite-ignore */ MOMENT_DE);
	moment.locale("en");
	await ccI18n.changeLanguage("en");
	for (const [proto, key] of [
		[Element.prototype, "scrollHeight"],
		[Element.prototype, "clientHeight"],
		[Element.prototype, "scrollTop"],
		[HTMLElement.prototype, "offsetTop"],
	] as const) {
		saved.set(key, Object.getOwnPropertyDescriptor(proto, key));
	}
	Object.defineProperty(Element.prototype, "scrollHeight", {
		configurable: true,
		get(this: Element) {
			return this.classList.contains(SCROLLER) ? listHeight(this) : 0;
		},
	});
	Object.defineProperty(Element.prototype, "clientHeight", {
		configurable: true,
		get(this: Element) {
			return this.classList.contains(SCROLLER) ? 300 : 0;
		},
	});
	Object.defineProperty(Element.prototype, "scrollTop", {
		configurable: true,
		get(this: Element) {
			return scrollTops.get(this) ?? 0;
		},
		set(this: Element, v: number) {
			scrollTops.set(this, v);
		},
	});
	Object.defineProperty(HTMLElement.prototype, "offsetTop", {
		configurable: true,
		get(this: HTMLElement) {
			return this.closest(".CcScrollableScheduleDay-today") ? TODAY_TOP : 0;
		},
	});
});
afterAll(() => {
	saved.forEach((d, key) => {
		const proto =
			key === "offsetTop" ? HTMLElement.prototype : Element.prototype;
		if (d) Object.defineProperty(proto, key, d);
		else delete (proto as unknown as Record<string, unknown>)[key];
	});
});

// Wed 2026-10-14 12:00 local
const WED = new Date(2026, 9, 14, 12);
beforeEach(() => {
	moment.locale("en");
	geometry.pendingPx = WEEK_PX;
	geometry.errorPx = WEEK_PX;
	vi.useFakeTimers({ now: WED });
});
afterEach(async () => {
	cleanup();
	vi.useRealTimers();
	vi.restoreAllMocks();
	moment.locale("en");
	if (ccI18n.language !== "en") {
		await act(async () => {
			await ccI18n.changeLanguage("en");
		});
	}
});

/** advances fake time in steps so loads and renders run in between */
const advance = async (ms: number, step = 20) => {
	for (let t = 0; t < ms; t += step) {
		await act(async () => {
			await vi.advanceTimersByTimeAsync(step);
		});
	}
};
/** 7 days, one entry each, titled `<tag>-idx<i>` (i = index in the result) */
const week = (tag: string): IDayData[][] =>
	Array.from({ length: 7 }, (_, i) => [
		{ id: `${tag}-${i}`, title: `${tag}-idx${i}` },
	]);
const deferred = <T,>() => {
	let resolve!: (v: T) => void;
	let reject!: (e: unknown) => void;
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
};
const scrollerOf = (container: HTMLElement) =>
	container.querySelector<HTMLElement>("." + SCROLLER)!;
const scrollTo = (el: HTMLElement, top: number) => {
	el.scrollTop = top;
	el.dispatchEvent(new Event("scroll"));
};
const scrollToBottom = (el: HTMLElement) =>
	scrollTo(el, el.scrollHeight - el.clientHeight);
const weekLabels = (container: HTMLElement) =>
	Array.from(scrollerOf(container).querySelectorAll(".MuiGrid-container > div"))
		.map((d) => d.textContent ?? "")
		.filter(isWeekLabel);
const allEntries = (container: HTMLElement) =>
	Array.from(scrollerOf(container).querySelectorAll("button")).map(
		(b) => b.textContent,
	);

/** one checkbox filter, checked by default */
const ONE_CHECKBOX: Record<string, ScheduleFilterDefinition> = {
	f: { type: "checkbox", label: "F", defaultValue: true },
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("fill and weeks", () => {
	it("[ISSUE-3478-ITEM-1] a new loadWeekCallback does not leave the shown weeks with the old one's data", async () => {
		const calls: string[] = [];
		const Harness = ({ tag }: { tag: string }) => {
			const cb = useCallback(
				(o: number) => {
					calls.push(`${tag}${o}`);
					return week(`${tag}${o}`);
				},
				[tag],
			);
			return (
				<ScrollableSchedule wrapperClass={SCROLLER} loadWeekCallback={cb} />
			);
		};
		const { container, rerender } = render(<Harness tag="A" />);
		await advance(400);
		expect(calls).toEqual(["A0", "A1"]);
		rerender(<Harness tag="B" />);
		await advance(400);
		const scroller = scrollerOf(container);
		scrollToBottom(scroller);
		await advance(400);
		// the list shows data of one callback only: B's (reloaded or reset)
		const entries = allEntries(container);
		expect(entries.length).toBeGreaterThan(0);
		expect(entries.filter((t) => !t?.startsWith("B"))).toEqual([]);
	});

	it("[ISSUE-3478-ITEM-1] a new loadWeekCallback reloads the weeks in the list with the filter values; their rows stay until the new result arrives", async () => {
		const calls: [string, number, Record<string, string | boolean>][] = [];
		const pendingB: Record<
			number,
			ReturnType<typeof deferred<IDayData[][]>>
		> = {};
		const Harness = ({ tag }: { tag: string }) => {
			const cb = useCallback<LoadWeekCallback>(
				(o, filters) => {
					calls.push([tag, o, filters]);
					if (tag === "A") return week(`A${o}`);
					pendingB[o] = deferred<IDayData[][]>();
					return pendingB[o].promise;
				},
				[tag],
			);
			return (
				<ScrollableSchedule
					wrapperClass={SCROLLER}
					loadWeekCallback={cb}
					filters={ONE_CHECKBOX}
				/>
			);
		};
		const { container, rerender } = render(<Harness tag="A" />);
		await advance(400);
		const labels = weekLabels(container);
		expect(labels).toEqual([
			"Week 42, 11 Oct - 17 Oct",
			"Week 43, 18 Oct - 24 Oct",
		]);
		rerender(<Harness tag="B" />);
		await advance(400);
		expect(calls.map(([tag, o]) => tag + o)).toEqual(["A0", "A1", "B0", "B1"]);
		expect(calls.map(([, , filters]) => filters)).toEqual(
			Array(4).fill({ f: true }),
		);
		// B is pending: the weeks keep A's rows, no spinner, no reset
		expect(
			scrollerOf(container).querySelectorAll(".MuiCircularProgress-root"),
		).toHaveLength(0);
		expect(weekLabels(container)).toEqual(labels);
		expect(allEntries(container).filter((t) => t?.endsWith("-idx0"))).toEqual([
			"A0-idx0",
			"A1-idx0",
		]);
		await act(async () => {
			pendingB[1].resolve(week("B1"));
			pendingB[0].resolve(week("B0"));
			await Promise.all([pendingB[0].promise, pendingB[1].promise]);
		});
		expect(weekLabels(container)).toEqual(labels);
		const entries = allEntries(container);
		expect(entries.filter((t) => t?.endsWith("-idx0"))).toEqual([
			"B0-idx0",
			"B1-idx0",
		]);
		expect(entries.filter((t) => !t?.startsWith("B"))).toEqual([]);
	});

	it("[ISSUE-3478-ITEM-1] a result or rejection of the previous loadWeekCallback that arrives late is dropped", async () => {
		const pendingA: ReturnType<typeof deferred<IDayData[][]>>[] = [];
		const a = vi.fn<LoadWeekCallback>(() => {
			const d = deferred<IDayData[][]>();
			pendingA.push(d);
			return d.promise;
		});
		const b = vi.fn<LoadWeekCallback>((o) => week(`B${o}`));
		const { container, rerender } = render(
			<ScrollableSchedule wrapperClass={SCROLLER} loadWeekCallback={a} />,
		);
		await advance(400);
		expect(a).toHaveBeenCalledTimes(2);
		rerender(
			<ScrollableSchedule wrapperClass={SCROLLER} loadWeekCallback={b} />,
		);
		await advance(400);
		expect(b.mock.calls.map((c) => c[0])).toEqual([0, 1]);
		await act(async () => {
			pendingA[0].resolve(week("A0"));
			pendingA[1].reject(new Error("A failed"));
			await Promise.allSettled(pendingA.map((d) => d.promise));
		});
		expect(scrollerOf(container).textContent).not.toContain("A failed");
		const entries = allEntries(container);
		expect(entries.filter((t) => t?.endsWith("-idx0"))).toEqual([
			"B0-idx0",
			"B1-idx0",
		]);
		expect(entries.filter((t) => !t?.startsWith("B"))).toEqual([]);
		expect(a).toHaveBeenCalledTimes(2);
	});

	it("[ISSUE-3478-ITEM-1] a re-render with the same loadWeekCallback loads no week again", async () => {
		const cb = vi.fn<LoadWeekCallback>((o) => week(`w${o}`));
		const { rerender } = render(
			<ScrollableSchedule
				wrapperClass={SCROLLER}
				loadWeekCallback={cb}
				filters={ONE_CHECKBOX}
			/>,
		);
		await advance(400);
		rerender(
			<ScrollableSchedule
				wrapperClass={SCROLLER}
				loadWeekCallback={cb}
				filters={ONE_CHECKBOX}
				className="other"
			/>,
		);
		await advance(400);
		expect(cb.mock.calls.map((c) => c[0])).toEqual([0, 1]);
	});
});
