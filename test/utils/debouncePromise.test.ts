import { describe, it, expect, vi } from "vitest";
import debouncePromise from "../../src/utils/debouncePromise";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("debouncePromise", () => {
	it("only invokes the function once for calls within the timeout", async () => {
		const func = vi.fn((value: string) => Promise.resolve(value));
		const debounced = debouncePromise(func, 20);

		const results = await Promise.all([
			debounced("a"),
			debounced("b"),
			debounced("c"),
		]);

		expect(func).toHaveBeenCalledTimes(1);
		// the last call wins, everyone waiting gets its result
		expect(func).toHaveBeenCalledWith("c");
		expect(results).toEqual(["c", "c", "c"]);
	});

	it("rejects all waiting callers", async () => {
		const error = new Error("nope");
		const debounced = debouncePromise(() => Promise.reject(error), 20);

		const first = debounced();
		const second = debounced();

		await expect(first).rejects.toBe(error);
		await expect(second).rejects.toBe(error);
	});

	it("resolves a caller with the result of its own invocation", async () => {
		// a request which is already running when the next call comes in must not resolve
		// that later call with its outdated result, no matter which one completes first
		const func = vi.fn((query: string) =>
			sleep(query === "" ? 60 : 200).then(() => query),
		);
		const debounced = debouncePromise(func, 20);

		const initialLoad = debounced("");
		// let the initial load start before searching
		await sleep(40);
		const search = debounced("search");

		expect(await search).toBe("search");
		expect(await initialLoad).toBe("");
		expect(func).toHaveBeenCalledTimes(2);
	});

	it("keeps debouncing after an invocation completed", async () => {
		const func = vi.fn((value: string) => Promise.resolve(value));
		const debounced = debouncePromise(func, 20);

		expect(await debounced("a")).toBe("a");
		const results = await Promise.all([debounced("b"), debounced("c")]);

		expect(results).toEqual(["c", "c"]);
		expect(func).toHaveBeenCalledTimes(2);
	});

	it("drops the waiting calls on cancel, and debounces later calls as before", async () => {
		vi.useFakeTimers();
		try {
			const func = vi.fn((value: string) => Promise.resolve(value));
			const debounced = debouncePromise(func, 20);
			const settled = vi.fn();

			debounced("a").then(settled, settled);
			debounced.cancel();
			await vi.advanceTimersByTimeAsync(100);

			expect(func).not.toHaveBeenCalled();
			expect(settled).not.toHaveBeenCalled();

			const later = debounced("b");
			await vi.advanceTimersByTimeAsync(20);
			expect(await later).toBe("b");
			expect(func).toHaveBeenCalledTimes(1);
			expect(settled).not.toHaveBeenCalled();
		} finally {
			vi.useRealTimers();
		}
	});

	it("reads a timeout getter at each call", async () => {
		vi.useFakeTimers();
		try {
			const func = vi.fn((value: string) => Promise.resolve(value));
			let timeout = 20;
			const debounced = debouncePromise(func, () => timeout);

			timeout = 100;
			void debounced("a");
			await vi.advanceTimersByTimeAsync(99);
			expect(func).not.toHaveBeenCalled();
			await vi.advanceTimersByTimeAsync(1);
			expect(func).toHaveBeenCalledWith("a");
		} finally {
			vi.useRealTimers();
		}
	});
});
