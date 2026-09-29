import { afterEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import {
	setLocalStorageState,
	useLocalStorageState,
} from "../../src/utils/useStorageState";
import { updateSelectorLru } from "../../src/standalone/Selector/BaseSelector";

const KEY = "test-storage-state";
const isStringArray = (data: unknown): data is string[] =>
	Array.isArray(data) && data.every((entry) => typeof entry === "string");
const useIds = (key: string | null = KEY) =>
	useLocalStorageState<string[]>(key, [], isStringArray);
const stored = () => JSON.parse(localStorage.getItem(KEY)!) as unknown;

afterEach(() => {
	localStorage.clear();
});

describe("useLocalStorageState", () => {
	it("starts with the stored value, or the default if it's missing or invalid", () => {
		expect(renderHook(() => useIds()).result.current[0]).toEqual([]);

		localStorage.setItem(KEY, JSON.stringify(["a"]));
		expect(renderHook(() => useIds()).result.current[0]).toEqual(["a"]);

		localStorage.setItem(KEY, JSON.stringify([1]));
		expect(renderHook(() => useIds()).result.current[0]).toEqual([]);

		localStorage.setItem(KEY, "{not json");
		expect(renderHook(() => useIds()).result.current[0]).toEqual([]);
	});

	it("stores an update and shares it with the other hooks using the key", () => {
		const first = renderHook(() => useIds());
		const second = renderHook(() => useIds());

		act(() => first.result.current[1](["a", "b"]));

		expect(first.result.current[0]).toEqual(["a", "b"]);
		expect(second.result.current[0]).toEqual(["a", "b"]);
		expect(stored()).toEqual(["a", "b"]);
	});

	it("keeps the value and the setter stable across renders", () => {
		localStorage.setItem(KEY, JSON.stringify(["a"]));
		const { result, rerender } = renderHook(() => useIds());
		const [value, setValue] = result.current;
		rerender();
		expect(result.current[0]).toBe(value);
		expect(result.current[1]).toBe(setValue);
	});

	it("applies a functional update to the stored value, not to an outdated copy", () => {
		localStorage.setItem(KEY, JSON.stringify(["local-1", "b"]));
		const { result } = renderHook(() => useIds());

		// written without the hook, e.g. by another script
		localStorage.setItem(KEY, JSON.stringify(["server-1", "b"]));
		act(() => result.current[1]((prev) => ["c", ...prev]));

		expect(result.current[0]).toEqual(["c", "server-1", "b"]);
		expect(stored()).toEqual(["c", "server-1", "b"]);
	});

	it("follows a change made in another tab", () => {
		localStorage.setItem(KEY, JSON.stringify(["a"]));
		const { result } = renderHook(() => useIds());

		act(() => {
			localStorage.setItem(KEY, JSON.stringify(["b"]));
			window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
		});
		expect(result.current[0]).toEqual(["b"]);

		act(() => {
			localStorage.clear();
			window.dispatchEvent(new StorageEvent("storage", { key: null }));
		});
		expect(result.current[0]).toEqual([]);
	});

	it("uses the default and stores nothing without a key", () => {
		const { result } = renderHook(() => useIds(null));
		act(() => result.current[1](["a"]));
		expect(result.current[0]).toEqual([]);
		expect(localStorage.length).toBe(0);
	});

	it("reads the new key's value when the key changes", () => {
		localStorage.setItem("other-key", JSON.stringify(["other"]));
		const { result, rerender } = renderHook(
			({ key }: { key: string }) => useIds(key),
			{ initialProps: { key: KEY } },
		);
		rerender({ key: "other-key" });
		expect(result.current[0]).toEqual(["other"]);
	});
});

describe("setLocalStorageState", () => {
	it("updates the mounted hooks using the key", () => {
		const { result } = renderHook(() => useIds());

		act(() => setLocalStorageState(KEY, [], isStringArray, ["a"]));
		expect(result.current[0]).toEqual(["a"]);

		act(() =>
			setLocalStorageState(KEY, [], isStringArray, (prev) => [...prev, "b"]),
		);
		expect(result.current[0]).toEqual(["a", "b"]);
		expect(stored()).toEqual(["a", "b"]);
	});

	it("passes the default to a functional update if nothing valid is stored", () => {
		localStorage.setItem(KEY, JSON.stringify("invalid"));
		setLocalStorageState(KEY, ["default"], isStringArray, (prev) => [
			...prev,
			"a",
		]);
		expect(stored()).toEqual(["default", "a"]);
	});
});

describe("updateSelectorLru", () => {
	it("replaces an ID in a mounted LRU cache", () => {
		localStorage.setItem(KEY, JSON.stringify(["local-1", "b"]));
		const { result } = renderHook(() => useIds());

		act(() =>
			updateSelectorLru(KEY, (ids) =>
				ids.map((id) => (id === "local-1" ? "server-1" : id)),
			),
		);

		expect(result.current[0]).toEqual(["server-1", "b"]);
		expect(stored()).toEqual(["server-1", "b"]);
	});

	it("starts from an empty LRU cache if none is stored", () => {
		updateSelectorLru(KEY, (ids) => [...ids, "a"]);
		expect(stored()).toEqual(["a"]);
	});
});
