import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import useAsyncMemo from "../../src/utils/useAsyncMemo";

/** A factory per key whose promises are resolved by the test */
const deferredFactory = () => {
	const pending: Record<string, (value: string) => void> = {};
	const factory = (key: string) => () =>
		new Promise<string>((resolve) => {
			pending[key] = resolve;
		});
	const resolve = (key: string, value: string) =>
		act(async () => {
			pending[key](value);
			await Promise.resolve();
		});
	return { factory, resolve };
};

const render = (
	factory: (key: string) => () => Promise<string>,
	keepPreviousResult?: boolean,
	key = "a",
) =>
	renderHook(
		(props: { dep: string }) =>
			useAsyncMemo(factory(props.dep), [props.dep], keepPreviousResult),
		{ initialProps: { dep: key } },
	);

describe("useAsyncMemo", () => {
	it("[ISSUE-3496-ITEM-4] a result for dependencies that changed while the factory ran is dropped", async () => {
		const { factory, resolve } = deferredFactory();
		const { result, rerender } = render(factory);
		rerender({ dep: "b" });
		await resolve("a", "from a");
		expect(result.current).toBeNull();
		await resolve("b", "from b");
		expect(result.current).toBe("from b");
	});

	it("[ISSUE-3496-ITEM-4] a result for earlier dependencies that arrives after the current one does not replace it", async () => {
		const { factory, resolve } = deferredFactory();
		const { result, rerender } = render(factory);
		rerender({ dep: "b" });
		await resolve("b", "from b");
		await resolve("a", "from a");
		expect(result.current).toBe("from b");
	});

	it("[ISSUE-3496-ITEM-4] with keepPreviousResult, the previous result stays until the current one arrives, and a late one does not replace it", async () => {
		const { factory, resolve } = deferredFactory();
		const { result, rerender } = render(factory, true);
		await resolve("a", "from a");
		rerender({ dep: "b" });
		rerender({ dep: "c" });
		expect(result.current).toBe("from a");
		await resolve("c", "from c");
		await resolve("b", "from b");
		expect(result.current).toBe("from c");
	});
});
