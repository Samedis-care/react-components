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
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	within,
} from "@testing-library/react";
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
// "Week N, …" label) counts WEEK_PX, so InfiniteScroll's fill check (until the
// content overflows by more than its default threshold of 250px) loads exactly
// weeks 0 and 1, and then week -1 above them, as the list is at its top once
// they fill it. A pending week (spinner) and a failed week (one text
// line) count WEEK_PX too, unless a test sets geometry.pendingPx/errorPx to the
// heights they have in a browser. scrollTop is writable per element. Today's
// day label (the jumpToToday target) reports offsetTop TODAY_TOP.
const SCROLLER = "sched";

const WEEK_PX = 300;

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

/**
 * What a browser does when the content of a scrolled container gets shorter
 * than its scroll position (jsdom does not): it clamps scrollTop to the new
 * maximum and fires a scroll event
 */
const clampScroll = (el: HTMLElement) => {
	const max = Math.max(0, el.scrollHeight - el.clientHeight);
	if (el.scrollTop > max) scrollTo(el, max);
};

const weekLabels = (container: HTMLElement) =>
	Array.from(scrollerOf(container).querySelectorAll(".MuiGrid-container > div"))
		.map((d) => d.textContent ?? "")
		.filter(isWeekLabel);

const dayRows = (container: HTMLElement) =>
	Array.from(
		scrollerOf(container).querySelectorAll<HTMLElement>(
			"[class*=CcScrollableScheduleDay-root]",
		),
	);

const allEntries = (container: HTMLElement) =>
	Array.from(scrollerOf(container).querySelectorAll("button")).map(
		(b) => b.textContent,
	);

const todayRow = (container: HTMLElement) =>
	container.querySelector<HTMLElement>(".CcScrollableScheduleDay-today");

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
		expect(calls).toEqual(["A0", "A1", "A-1"]);
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
			"Week 41, 04 Oct - 10 Oct",
			"Week 42, 11 Oct - 17 Oct",
			"Week 43, 18 Oct - 24 Oct",
		]);
		rerender(<Harness tag="B" />);
		await advance(400);
		expect(calls.map(([tag, o]) => tag + o)).toEqual([
			"A0",
			"A1",
			"A-1",
			"B-1",
			"B0",
			"B1",
		]);
		expect(calls.map(([, , filters]) => filters)).toEqual(
			Array(6).fill({ f: true }),
		);
		// B is pending: the weeks keep A's rows, no spinner, no reset
		expect(
			scrollerOf(container).querySelectorAll(".MuiCircularProgress-root"),
		).toHaveLength(0);
		expect(weekLabels(container)).toEqual(labels);
		expect(allEntries(container).filter((t) => t?.endsWith("-idx0"))).toEqual([
			"A-1-idx0",
			"A0-idx0",
			"A1-idx0",
		]);
		await act(async () => {
			pendingB[1].resolve(week("B1"));
			pendingB[-1].resolve(week("B-1"));
			pendingB[0].resolve(week("B0"));
			await Promise.all([
				pendingB[-1].promise,
				pendingB[0].promise,
				pendingB[1].promise,
			]);
		});
		expect(weekLabels(container)).toEqual(labels);
		const entries = allEntries(container);
		expect(entries.filter((t) => t?.endsWith("-idx0"))).toEqual([
			"B-1-idx0",
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
		expect(a).toHaveBeenCalledTimes(3);
		rerender(
			<ScrollableSchedule wrapperClass={SCROLLER} loadWeekCallback={b} />,
		);
		await advance(400);
		expect(b.mock.calls.map((c) => c[0])).toEqual([-1, 0, 1]);
		await act(async () => {
			pendingA[0].resolve(week("A0"));
			pendingA[1].reject(new Error("A failed"));
			pendingA[2].resolve(week("A-1"));
			await Promise.allSettled(pendingA.map((d) => d.promise));
		});
		expect(scrollerOf(container).textContent).not.toContain("A failed");
		const entries = allEntries(container);
		expect(entries.filter((t) => t?.endsWith("-idx0"))).toEqual([
			"B-1-idx0",
			"B0-idx0",
			"B1-idx0",
		]);
		expect(entries.filter((t) => !t?.startsWith("B"))).toEqual([]);
		expect(a).toHaveBeenCalledTimes(3);
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
		expect(cb.mock.calls.map((c) => c[0])).toEqual([0, 1, -1]);
	});
});

describe("header filters and actions", () => {
	it("[ISSUE-3478-ITEM-2] a filter change starts the list over at the current week, as on mount, also when emptying the scrolled list fires a scroll event at its top", async () => {
		const cb = vi.fn<LoadWeekCallback>((o) => week(`w${o}`));
		const { container } = render(
			<ScrollableSchedule
				wrapperClass={SCROLLER}
				loadWeekCallback={cb}
				filters={{
					mine: { type: "checkbox", label: "Mine", defaultValue: false },
				}}
			/>,
		);
		await advance(400);
		// the current week first; below lg the list then loads the week above it
		const offsetsOnMount = cb.mock.calls.map((c) => c[0]);
		expect(offsetsOnMount.slice(0, 2)).toEqual([0, 1]);
		const labelsOnMount = weekLabels(container);
		const scrollTopOnMount = scrollerOf(container).scrollTop;
		// the user has scrolled down into the list
		scrollTo(scrollerOf(container), 50);
		await advance(200);
		const box = screen.getByRole("checkbox", { name: "Mine" });
		act(() => box.focus());
		fireEvent.click(box);
		// the browser clamps the scroll position once the list is emptied
		act(() => clampScroll(scrollerOf(container)));
		await advance(400);
		expect(cb.mock.calls.slice(offsetsOnMount.length)).toEqual(
			offsetsOnMount.map((offset) => [offset, { mine: true }]),
		);
		expect(weekLabels(container)).toEqual(labelsOnMount);
		expect(scrollerOf(container).scrollTop).toBe(scrollTopOnMount);
		// the focus stays on the filter
		expect(box).toHaveFocus();
	});
});

describe("language change", () => {
	it("[ISSUE-3478-ITEM-2] a language change starts the list over at the current week, as on mount, also when emptying the scrolled list fires a scroll event at its top", async () => {
		const cb = vi.fn<LoadWeekCallback>((o) => week(`w${o}`));
		const { container } = render(
			<ScrollableSchedule
				wrapperClass={SCROLLER}
				loadWeekCallback={cb}
				filters={{
					mine: { type: "checkbox", label: "Mine", defaultValue: true },
				}}
			/>,
		);
		await advance(400);
		// the current week first; below lg the list then loads the week above it
		const offsetsOnMount = cb.mock.calls.map((c) => c[0]);
		expect(offsetsOnMount.slice(0, 2)).toEqual([0, 1]);
		const scrollTopOnMount = scrollerOf(container).scrollTop;
		// the user has scrolled down into the list
		scrollTo(scrollerOf(container), 50);
		await advance(200);
		// the app switches moment first, as apps do
		moment.locale("de");
		await act(async () => {
			await ccI18n.changeLanguage("de");
		});
		// the browser clamps the scroll position once the list is emptied
		act(() => clampScroll(scrollerOf(container)));
		await advance(400);
		expect(cb.mock.calls.slice(offsetsOnMount.length)).toEqual(
			offsetsOnMount.map((offset) => [offset, { mine: true }]),
		);
		// as on mount: the current week, the next one, and the week above them
		expect(weekLabels(container)).toEqual([
			"Woche 41, 05 Okt. - 11 Okt.",
			"Woche 42, 12 Okt. - 18 Okt.",
			"Woche 43, 19 Okt. - 25 Okt.",
		]);
		expect(scrollerOf(container).scrollTop).toBe(scrollTopOnMount);
	});

	it("[ISSUE-3478-ITEM-2] when a language change starts the list over, focus on the list stays on it", async () => {
		const { container } = render(
			<ScrollableSchedule
				wrapperClass={SCROLLER}
				loadWeekCallback={(o) => week(`w${o}`)}
			/>,
		);
		await advance(400);
		act(() => scrollerOf(container).focus());
		await act(async () => {
			await ccI18n.changeLanguage("de");
		});
		await advance(400);
		expect(scrollerOf(container)).toHaveFocus();
	});

	it("[ISSUE-3478-ITEM-2] when a language change starts the list over, focus on an entry moves to the list instead of the page", async () => {
		const { container } = render(
			<ScrollableSchedule
				wrapperClass={SCROLLER}
				loadWeekCallback={(o) => week(`w${o}`)}
			/>,
		);
		await advance(400);
		const entry = scrollerOf(container).querySelector("button")!;
		act(() => entry.focus());
		expect(entry).toHaveFocus();
		await act(async () => {
			await ccI18n.changeLanguage("de");
		});
		await advance(400);
		expect(scrollerOf(container)).toHaveFocus();
	});
});

describe("accessibility", () => {
	it("[ISSUE-3478-ITEM-16] a failed week keeps its week label and announces the error", async () => {
		const { container } = render(
			<ScrollableSchedule
				wrapperClass={SCROLLER}
				loadWeekCallback={(o) =>
					o === 0 ? Promise.reject(new Error("Network failure")) : week("w" + o)
				}
			/>,
		);
		await advance(400);
		// announced through an alert or a polite status region
		const announcer =
			screen.queryByRole("alert") ?? screen.queryByRole("status");
		expect(announcer, "no alert or status region").not.toBeNull();
		expect(announcer).toHaveTextContent("Network failure");
		expect(weekLabels(container)).toContain("Week 42, 11 Oct - 17 Oct");
	});
	it("[ISSUE-3478-ITEM-16] Retry loads the failed week again with the filter values; its rows replace the error", async () => {
		let fail = true;
		const cb = vi.fn<LoadWeekCallback>((o) =>
			o === 0 && fail
				? Promise.reject(new Error("Network failure"))
				: week("w" + o),
		);
		const { container } = render(
			<ScrollableSchedule
				wrapperClass={SCROLLER}
				loadWeekCallback={cb}
				filters={ONE_CHECKBOX}
			/>,
		);
		await advance(400);
		const alert = screen.getByRole("alert");
		const callsOfWeek0 = () => cb.mock.calls.filter(([o]) => o === 0);
		expect(callsOfWeek0()).toEqual([[0, { f: true }]]);
		fail = false;
		fireEvent.click(within(alert).getByRole("button", { name: "Retry" }));
		await advance(400);
		expect(callsOfWeek0()).toEqual([
			[0, { f: true }],
			[0, { f: true }],
		]);
		expect(screen.queryByRole("alert")).toBeNull();
		expect(weekLabels(container)).toContain("Week 42, 11 Oct - 17 Oct");
		expect(allEntries(container)).toContain("w0-idx0");
	});
	it("[ISSUE-3478-ITEM-16] the error is announced once: the failed week re-renders with the same alert", async () => {
		const failing: LoadWeekCallback = (o) =>
			o === 0 ? Promise.reject(new Error("Network failure")) : week("w" + o);
		const reload = deferred<IDayData[][]>();
		const { rerender } = render(
			<ScrollableSchedule wrapperClass={SCROLLER} loadWeekCallback={failing} />,
		);
		await advance(400);
		const alert = screen.getByRole("alert");
		// a new loadWeekCallback re-renders the week; the error stays until the
		// new result arrives
		rerender(
			<ScrollableSchedule
				wrapperClass={SCROLLER}
				loadWeekCallback={(o) => (o === 0 ? reload.promise : week("w" + o))}
			/>,
		);
		await advance(400);
		expect(screen.getByRole("alert")).toBe(alert);
		await act(async () => {
			reload.reject(new Error("Network failure"));
			await reload.promise.catch(() => {});
		});
		expect(screen.getByRole("alert")).toBe(alert);
	});
	it("[ISSUE-3478-ITEM-16] the error names the week, and each Retry button is described by its week's error", async () => {
		render(
			<ScrollableSchedule
				wrapperClass={SCROLLER}
				loadWeekCallback={(o) => Promise.reject(new Error(`Server error ${o}`))}
			/>,
		);
		await advance(400);
		const alerts = screen.getAllByRole("alert");
		for (const [weekNo, offset] of [
			[42, 0],
			[43, 1],
		]) {
			const title = `Week ${weekNo} could not be loaded`;
			const alert = alerts.find((a) => a.textContent?.startsWith(title));
			expect(alert, title).toBeDefined();
			expect(alert).toHaveTextContent(`Server error ${offset}`);
			expect(
				within(alert!).getByRole("button", { name: "Retry" }),
			).toHaveAccessibleDescription(`${title} Server error ${offset}`);
		}
	});
	it("[ISSUE-3478-ITEM-16] Retry moves the focus to the week line, which keeps it when the week loads", async () => {
		let fail = true;
		const pending = deferred<IDayData[][]>();
		const { container } = render(
			<ScrollableSchedule
				wrapperClass={SCROLLER}
				loadWeekCallback={(o) =>
					o !== 0
						? week("w" + o)
						: fail
							? Promise.reject(new Error("Network failure"))
							: pending.promise
				}
			/>,
		);
		await advance(400);
		const retry = screen.getByRole("button", { name: "Retry" });
		retry.focus();
		fail = false;
		fireEvent.click(retry);
		await advance(100);
		const line = document.activeElement as HTMLElement;
		expect(line.textContent).toBe("Week 42, 11 Oct - 17 Oct");
		// the retry is pending: a spinner below the week line, no alert
		expect(screen.queryByRole("alert")).toBeNull();
		expect(screen.getAllByRole("progressbar")).toHaveLength(1);
		await act(async () => {
			pending.resolve(week("w0"));
			await pending.promise;
		});
		expect(screen.queryAllByRole("progressbar")).toHaveLength(0);
		expect(allEntries(container)).toContain("w0-idx0");
		expect(line).toHaveFocus();
		expect(line.isConnected).toBe(true);
	});
	it("[ISSUE-3478-ITEM-16] a retry that fails again shows a new alert with the new error", async () => {
		const errors = ["Network failure", "Still down"];
		render(
			<ScrollableSchedule
				wrapperClass={SCROLLER}
				loadWeekCallback={(o) =>
					o === 0 ? Promise.reject(new Error(errors.shift())) : week("w" + o)
				}
			/>,
		);
		await advance(400);
		const first = screen.getByRole("alert");
		expect(first).toHaveTextContent("Network failure");
		fireEvent.click(within(first).getByRole("button", { name: "Retry" }));
		await advance(400);
		const second = screen.getByRole("alert");
		// inserted anew, so a screen reader announces it again
		expect(second).not.toBe(first);
		expect(second).toHaveTextContent("Still down");
		expect(first.isConnected).toBe(false);
	});
	it("[ISSUE-3478-ITEM-16] de: the error and the Retry button are in German", async () => {
		moment.locale("de");
		await act(async () => {
			await ccI18n.changeLanguage("de");
		});
		render(
			<ScrollableSchedule
				wrapperClass={SCROLLER}
				loadWeekCallback={(o) =>
					o === 0 ? Promise.reject(new Error("Network failure")) : week("w" + o)
				}
			/>,
		);
		await advance(400);
		const alert = screen.getByRole("alert");
		expect(alert).toHaveTextContent("Woche 42 konnte nicht geladen werden");
		expect(
			within(alert).getByRole("button", { name: "Erneut versuchen" }),
		).toBeInTheDocument();
	});
	it("[ISSUE-3478-ITEM-19] today's row is marked as the current date", async () => {
		const { container } = render(
			<ScrollableSchedule
				wrapperClass={SCROLLER}
				loadWeekCallback={(o) => week("w" + o)}
			/>,
		);
		await advance(400);
		const current = container.querySelectorAll("[aria-current='date']");
		expect(current).toHaveLength(1);
		const today = todayRow(container)!;
		expect(today.contains(current[0]) || current[0].contains(today)).toBe(true);
	});
	it("[ISSUE-3478-ITEM-19] by default today's row has a bar on its left edge and a bold label; the other rows have neither", async () => {
		const { container } = render(
			<ScrollableSchedule
				wrapperClass={SCROLLER}
				loadWeekCallback={(o) => week("w" + o)}
			/>,
		);
		await advance(400);
		const rows = dayRows(container);
		// whole weeks of 7 day rows: at least the current and the next one (mount
		// also loads the week above, through InfiniteScroll)
		expect(rows.length % 7).toBe(0);
		expect(rows.length).toBeGreaterThanOrEqual(14);
		const today = todayRow(container)!;
		// a border survives forced-colors mode, which replaces backgrounds
		const marked = rows.filter(
			(r) =>
				getComputedStyle(r).borderLeftStyle === "solid" &&
				getComputedStyle(r).borderLeftWidth === "4px",
		);
		expect(marked).toEqual([today]);
		const bold = rows.filter((r) => getComputedStyle(r).fontWeight === "700");
		expect(bold).toEqual([today]);
		// the padding shrinks by the bar's width: every label stays in line
		const inset = (r: HTMLElement) =>
			(parseFloat(getComputedStyle(r).borderLeftWidth) || 0) +
			parseFloat(getComputedStyle(r).paddingLeft);
		expect(rows.map(inset)).toEqual(rows.map(() => 8));
	});
});

describe("scroll container", () => {
	it("[ISSUE-3471-ITEM-12] the date button scrolls the list to today's row", async () => {
		const { container } = render(
			<ScrollableSchedule
				wrapperClass={SCROLLER}
				loadWeekCallback={(o) => week("w" + o)}
			/>,
		);
		await advance(400);
		const scroller = scrollerOf(container);
		expect(scroller.scrollTop).not.toBe(TODAY_TOP);
		fireEvent.click(screen.getByRole("button", { name: "Wed 14 October" }));
		expect(scroller.scrollTop).toBe(TODAY_TOP);
	});
});
