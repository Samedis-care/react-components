import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import useAgeTick from "../../src/utils/useAgeTick";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const T0 = new Date(2026, 10, 13, 12, 0, 0).getTime();

type Timestamp = Parameters<typeof useAgeTick>[0];

const mount = (timestamp: Timestamp) =>
	renderHook(({ timestamp }) => useAgeTick(timestamp), {
		initialProps: { timestamp },
	});

const advance = (ms: number) =>
	act(() => {
		vi.advanceTimersByTime(ms);
	});

describe("useAgeTick", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(T0);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("[ISSUE-3469-ITEM-2] re-renders on every whole second of the age while it is below a minute", () => {
		const { result, unmount } = mount(T0 - 300);
		expect(result.current).toBe(T0);
		advance(699);
		expect(result.current).toBe(T0);
		advance(1); // the age is 1 s
		expect(result.current).toBe(T0 + 700);
		advance(999);
		expect(result.current).toBe(T0 + 700);
		advance(1); // 2 s
		expect(result.current).toBe(T0 + 1700);
		unmount();
	});

	it("[ISSUE-3469-ITEM-2] re-renders on every whole minute of the age from a minute on", () => {
		const { result, unmount } = mount(new Date(T0 - 59_500));
		advance(500); // the age is 1 min
		expect(result.current).toBe(T0 + 500);
		advance(MINUTE - 1);
		expect(result.current).toBe(T0 + 500);
		advance(1); // 2 min
		expect(result.current).toBe(T0 + 500 + MINUTE);
		unmount();
	});

	it("[ISSUE-3469-ITEM-2] re-renders on whole minutes also for an age of hours", () => {
		const { result, unmount } = mount(T0 - 3 * HOUR - 20 * SECOND);
		advance(40 * SECOND - 1);
		expect(result.current).toBe(T0);
		advance(1); // 3 h 1 min
		expect(result.current).toBe(T0 + 40 * SECOND);
		advance(MINUTE - 1);
		expect(result.current).toBe(T0 + 40 * SECOND);
		advance(1);
		expect(result.current).toBe(T0 + 40 * SECOND + MINUTE);
		unmount();
	});

	it("[ISSUE-3469-ITEM-2] counts down to a time in the future, by minutes and then by seconds", () => {
		const { result, unmount } = mount(T0 + MINUTE + SECOND);
		advance(SECOND);
		expect(result.current).toBe(T0);
		advance(1); // just below a minute ahead
		expect(result.current).toBe(T0 + SECOND + 1);
		advance(SECOND - 1);
		expect(result.current).toBe(T0 + SECOND + 1);
		advance(1); // just below 59 s ahead
		expect(result.current).toBe(T0 + 2 * SECOND + 1);
		unmount();
	});

	it("[ISSUE-3469-ITEM-2] follows a new time", () => {
		const { result, rerender, unmount } = mount(T0 - 90 * SECOND);
		advance(SECOND);
		expect(result.current).toBe(T0);
		rerender({ timestamp: T0 + SECOND - 300 }); // the age is 300 ms
		advance(699);
		expect(result.current).toBe(T0);
		advance(1);
		expect(result.current).toBe(T0 + 2 * SECOND - 300);
		unmount();
	});

	it.each([
		["null", null],
		["undefined", undefined],
		["NaN", NaN],
		["an invalid Date", new Date("garbage")],
	])("[ISSUE-3469-ITEM-2] starts no timer for %s", (_, timestamp) => {
		const { result, unmount } = mount(timestamp);
		expect(vi.getTimerCount()).toBe(0);
		advance(HOUR);
		expect(result.current).toBe(T0);
		unmount();
	});

	it("[ISSUE-3469-ITEM-2] stops its timer on unmount", () => {
		const { unmount } = mount(T0);
		expect(vi.getTimerCount()).toBe(1);
		unmount();
		expect(vi.getTimerCount()).toBe(0);
	});
});
