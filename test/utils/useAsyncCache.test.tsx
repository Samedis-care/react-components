import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import useAsyncCache from "../../src/utils/useAsyncCache";

describe("useAsyncCache", () => {
	it("[ISSUE-3496-ITEM-22] a rejecting factory's error is exposed, and reset runs the factory again", async () => {
		const failure = new Error("offline");
		let calls = 0;
		const factory = () => {
			calls++;
			return calls === 1 ? Promise.reject(failure) : Promise.resolve("loaded");
		};
		const { result } = renderHook(() => useAsyncCache(factory, []));
		await act(() => Promise.resolve());
		expect(result.current.value).toBeNull();
		expect(result.current.error).toBe(failure);

		act(() => result.current.reset());
		expect(result.current.error).toBeNull();
		await act(() => Promise.resolve());
		expect(calls).toBe(2);
		expect(result.current.value).toBe("loaded");
		expect(result.current.error).toBeNull();
	});
});
