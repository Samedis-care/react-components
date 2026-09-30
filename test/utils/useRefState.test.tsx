import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import useRefState from "../../src/utils/useRefState";

describe("useRefState", () => {
	it("runs a lazy initializer once, for both the ref and the state", () => {
		let calls = 0;
		const init = () => {
			calls++;
			return { value: 1 };
		};
		const { result, rerender } = renderHook(() => useRefState(init));

		rerender();
		rerender();
		expect(calls).toBe(1);
		expect(result.current.get()).toBe(result.current.state);
	});

	it("keeps the ref and the state in sync on updates", () => {
		const { result } = renderHook(() => useRefState(1));

		act(() => result.current.set((prev) => prev + 1));
		expect(result.current.get()).toBe(2);
		expect(result.current.state).toBe(2);
	});
});
