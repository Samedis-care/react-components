import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import useDebouncedValue from "../../src/utils/useDebouncedValue";

const DELAY = 100;

const render = <T,>(value: T, isEqual?: (a: T, b: T) => boolean) =>
	renderHook(({ value }) => useDebouncedValue(value, DELAY, isEqual), {
		initialProps: { value },
	});

const advance = (ms: number) =>
	act(() => {
		vi.advanceTimersByTime(ms);
	});

describe("useDebouncedValue", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("returns the latest value once it stayed unchanged for the delay", () => {
		const { result, rerender } = render("a");
		expect(result.current).toBe("a");

		rerender({ value: "ab" });
		advance(DELAY - 1);
		rerender({ value: "abc" });
		advance(DELAY - 1);
		expect(result.current).toBe("a");

		advance(1);
		expect(result.current).toBe("abc");
	});

	it("compares by content, so a value rebuilt on every render doesn't restart the timer", () => {
		const initial = { prefix: "A" };
		const { result, rerender } = render(initial);

		rerender({ value: { prefix: "B" } });
		advance(DELAY / 2);
		rerender({ value: { prefix: "B" } });
		advance(DELAY / 2);
		expect(result.current).toEqual({ prefix: "B" });
	});

	it("keeps returning the same object while the content goes and comes back", () => {
		const initial = { prefix: "A" };
		const { result, rerender } = render(initial);

		rerender({ value: { prefix: "B" } });
		advance(DELAY / 2);
		rerender({ value: { prefix: "A" } });
		advance(DELAY);
		expect(result.current).toBe(initial);
	});

	it("uses isEqual to tell if the value changed", () => {
		const byId = (a: { id: number }, b: { id: number }) => a.id === b.id;
		const initial = { id: 1, label: "one" };
		const { result, rerender } = render(initial, byId);

		rerender({ value: { id: 1, label: "uno" } });
		advance(DELAY);
		expect(result.current).toBe(initial);

		rerender({ value: { id: 2, label: "two" } });
		advance(DELAY);
		expect(result.current).toEqual({ id: 2, label: "two" });
	});

	it("clears its timer on unmount", () => {
		const { rerender, unmount } = render("a");

		rerender({ value: "b" });
		expect(vi.getTimerCount()).toBe(1);
		unmount();
		expect(vi.getTimerCount()).toBe(0);
	});
});
