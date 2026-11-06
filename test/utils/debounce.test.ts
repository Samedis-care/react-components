import { describe, expect, it, vi } from "vitest";
import debounce from "../../src/utils/debounce";

describe("debounce", () => {
	it("[ISSUE-3502-ITEM-3] cancel drops the waiting call, and later calls are debounced as before", () => {
		vi.useFakeTimers();
		try {
			const func = vi.fn();
			const debounced = debounce(func, 20);

			debounced("a");
			debounced.cancel();
			vi.advanceTimersByTime(100);
			expect(func).not.toHaveBeenCalled();

			debounced("b");
			debounced("c");
			vi.advanceTimersByTime(19);
			expect(func).not.toHaveBeenCalled();
			vi.advanceTimersByTime(1);
			expect(func.mock.calls).toEqual([["c"]]);
			// nothing is waiting any more: cancel does nothing
			debounced.cancel();
			vi.advanceTimersByTime(100);
			expect(func).toHaveBeenCalledTimes(1);
		} finally {
			vi.useRealTimers();
		}
	});
});
