import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import useAsyncMemo from "../../src/utils/useAsyncMemo";

/** A factory per key whose promises are settled by the test */
const deferredFactory = () => {
	const pending: Record<
		string,
		{ resolve: (value: string) => void; reject: (reason: unknown) => void }
	> = {};
	const factory = (key: string) => () =>
		new Promise<string>((resolve, reject) => {
			pending[key] = { resolve, reject };
		});
	const resolve = (key: string, value: string) =>
		act(async () => {
			pending[key].resolve(value);
			await Promise.resolve();
		});
	const reject = (key: string, reason: unknown) =>
		act(async () => {
			pending[key].reject(reason);
			await Promise.resolve();
		});
	return { factory, resolve, reject };
};

const render = (
	factory: (key: string) => () => Promise<string> | string,
	keepPreviousResult?: boolean,
	key = "a",
) =>
	renderHook(
		(props: { dep: string }) =>
			useAsyncMemo(factory(props.dep), [props.dep], keepPreviousResult),
		{ initialProps: { dep: key } },
	);

/** The part of Node's process this file uses (the test config has no Node types) */
interface RejectionEvents {
	listeners(event: "unhandledRejection"): ((reason: unknown) => void)[];
	removeAllListeners(event: "unhandledRejection"): void;
	on(event: "unhandledRejection", listener: (reason: unknown) => void): void;
	off(event: "unhandledRejection", listener: (reason: unknown) => void): void;
}

const nodeProcess = (globalThis as unknown as { process: RejectionEvents })
	.process;

/** Node reports an unhandled rejection once the microtask queue has drained */
const nextMacrotask = () =>
	act(() => new Promise<void>((resolve) => setTimeout(resolve, 0)));

describe("useAsyncMemo", () => {
	it("[ISSUE-3496-ITEM-4] a result for dependencies that changed while the factory ran is dropped", async () => {
		const { factory, resolve } = deferredFactory();
		const { result, rerender } = render(factory);
		rerender({ dep: "b" });
		await resolve("a", "from a");
		expect(result.current.value).toBeNull();
		await resolve("b", "from b");
		expect(result.current.value).toBe("from b");
	});

	it("[ISSUE-3496-ITEM-4] a result for earlier dependencies that arrives after the current one does not replace it", async () => {
		const { factory, resolve } = deferredFactory();
		const { result, rerender } = render(factory);
		rerender({ dep: "b" });
		await resolve("b", "from b");
		await resolve("a", "from a");
		expect(result.current.value).toBe("from b");
	});

	it("[ISSUE-3496-ITEM-4] with keepPreviousResult, the previous result stays until the current one arrives, and a late one does not replace it", async () => {
		const { factory, resolve } = deferredFactory();
		const { result, rerender } = render(factory, true);
		await resolve("a", "from a");
		rerender({ dep: "b" });
		rerender({ dep: "c" });
		expect(result.current.value).toBe("from a");
		await resolve("c", "from c");
		await resolve("b", "from b");
		expect(result.current.value).toBe("from c");
	});

	describe("a factory that fails", () => {
		// a leaked rejection is the bug: collect it instead of letting vitest fail the
		// whole run with it
		let vitestHandlers: ((reason: unknown) => void)[] = [];
		let unhandled: unknown[] = [];
		const collect = (reason: unknown) => void unhandled.push(reason);
		beforeEach(() => {
			unhandled = [];
			vitestHandlers = nodeProcess.listeners("unhandledRejection");
			nodeProcess.removeAllListeners("unhandledRejection");
			nodeProcess.on("unhandledRejection", collect);
		});
		afterEach(() => {
			nodeProcess.off("unhandledRejection", collect);
			vitestHandlers.forEach((handler) =>
				nodeProcess.on("unhandledRejection", handler),
			);
		});

		it("[ISSUE-3496-ITEM-22] a rejecting factory produces no unhandled rejection and the caller can see the error", async () => {
			const { factory, reject } = deferredFactory();
			const { result } = render(factory);
			expect(result.current).toEqual({ value: null, error: null });
			const failure = new Error("offline");
			await reject("a", failure);
			await nextMacrotask();
			expect(unhandled.map(String)).toEqual([]);
			expect(result.current.value).toBeNull();
			expect(result.current.error).toBe(failure);
		});

		it("[ISSUE-3496-ITEM-22] a factory that throws instead of returning a rejected promise is reported the same way", async () => {
			const failure = new Error("broken");
			const { result } = render(() => () => {
				throw failure;
			});
			await waitFor(() => expect(result.current.error).toBe(failure));
			await nextMacrotask();
			expect(unhandled.map(String)).toEqual([]);
			expect(result.current.value).toBeNull();
		});

		it("[ISSUE-3496-ITEM-22] a rejection whose reason is not an Error is an Error, with the reason as its cause", async () => {
			const { factory, reject } = deferredFactory();
			const { result } = render(factory);
			await reject("a", undefined);
			await nextMacrotask();
			expect(unhandled).toEqual([]);
			expect(result.current.error).toBeInstanceOf(Error);
			expect(result.current.error?.cause).toBeUndefined();

			const { result: withString } = render(factory, false, "b");
			await reject("b", "timeout");
			expect(withString.current.error).toBeInstanceOf(Error);
			expect(withString.current.error?.message).toBe("timeout");
			expect(withString.current.error?.cause).toBe("timeout");
		});

		it("[ISSUE-3496-ITEM-22] the error is cleared when the dependencies change, and the result for the new ones shows", async () => {
			const { factory, resolve, reject } = deferredFactory();
			const { result, rerender } = render(factory);
			await reject("a", new Error("offline"));
			rerender({ dep: "b" });
			expect(result.current).toEqual({ value: null, error: null });
			await resolve("b", "from b");
			expect(result.current).toEqual({ value: "from b", error: null });
		});

		it("[ISSUE-3496-ITEM-22] a rejection for dependencies that changed while the factory ran is dropped, and is not unhandled", async () => {
			const { factory, resolve, reject } = deferredFactory();
			const { result, rerender } = render(factory);
			rerender({ dep: "b" });
			await reject("a", new Error("late"));
			await nextMacrotask();
			expect(unhandled.map(String)).toEqual([]);
			expect(result.current).toEqual({ value: null, error: null });
			await resolve("b", "from b");
			expect(result.current).toEqual({ value: "from b", error: null });
		});

		it("[ISSUE-3496-ITEM-22] with keepPreviousResult, the previous result stays next to the error", async () => {
			const { factory, resolve, reject } = deferredFactory();
			const { result, rerender } = render(factory, true);
			await resolve("a", "from a");
			rerender({ dep: "b" });
			const failure = new Error("offline");
			await reject("b", failure);
			expect(result.current).toEqual({ value: "from a", error: failure });
			rerender({ dep: "c" });
			expect(result.current).toEqual({ value: "from a", error: null });
			await resolve("c", "from c");
			expect(result.current).toEqual({ value: "from c", error: null });
		});

		it("[ISSUE-3496-ITEM-22] a rejection after unmount is not unhandled", async () => {
			const { factory, reject } = deferredFactory();
			const { unmount } = render(factory);
			unmount();
			await reject("a", new Error("offline"));
			await nextMacrotask();
			expect(unhandled.map(String)).toEqual([]);
		});
	});
});
