import { describe, it, expect } from "vitest";
import deepEqual from "../../src/utils/deepEqual";

describe("deepEqual", () => {
	describe("primitives", () => {
		it("compares strings", () => {
			expect(deepEqual("a", "a")).toBe(true);
			expect(deepEqual("a", "b")).toBe(false);
		});

		it("compares booleans", () => {
			expect(deepEqual(true, true)).toBe(true);
			expect(deepEqual(true, false)).toBe(false);
		});

		it("compares numbers", () => {
			expect(deepEqual(1, 1)).toBe(true);
			expect(deepEqual(1, 2)).toBe(false);
		});

		it("treats NaN as equal to NaN", () => {
			expect(deepEqual(NaN, NaN)).toBe(true);
		});

		it("treats +0 and -0 as not equal", () => {
			expect(deepEqual(0, -0)).toBe(false);
		});

		it("returns false for differing types", () => {
			expect(deepEqual(1, "1")).toBe(false);
			expect(deepEqual(0, false)).toBe(false);
		});
	});

	describe("bigint", () => {
		it("compares equal bigints", () => {
			expect(deepEqual(10n, 10n)).toBe(true);
		});

		it("compares unequal bigints", () => {
			expect(deepEqual(10n, 11n)).toBe(false);
		});

		it("does not throw for bigint with default unsupportedHandling", () => {
			expect(() => deepEqual(1n, 1n)).not.toThrow();
		});
	});

	describe("null and undefined", () => {
		it("treats null equal to null", () => {
			expect(deepEqual(null, null)).toBe(true);
		});

		it("treats undefined equal to undefined", () => {
			expect(deepEqual(undefined, undefined)).toBe(true);
		});

		it("treats null not equal to undefined (typeof differs)", () => {
			expect(deepEqual(null, undefined)).toBe(false);
		});

		it("treats null not equal to a value", () => {
			expect(deepEqual(null, 0)).toBe(false);
			expect(deepEqual(null, "")).toBe(false);
		});
	});

	describe("Date", () => {
		it("compares dates by timestamp", () => {
			expect(deepEqual(new Date(1000), new Date(1000))).toBe(true);
			expect(deepEqual(new Date(1000), new Date(2000))).toBe(false);
		});

		it("returns false when only one side is a Date", () => {
			expect(deepEqual(new Date(1000), 1000)).toBe(false);
		});
	});

	describe("arrays", () => {
		it("compares equal arrays", () => {
			expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
		});

		it("compares unequal arrays", () => {
			expect(deepEqual([1, 2, 3], [1, 2, 4])).toBe(false);
			expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
		});

		it("returns false when only one side is an array", () => {
			expect(deepEqual([1], { 0: 1, length: 1 })).toBe(false);
		});
	});

	describe("plain objects", () => {
		it("compares equal flat objects", () => {
			expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
		});

		it("ignores key order", () => {
			expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
		});

		it("compares unequal flat objects", () => {
			expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
			expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
		});

		it("recurses into nested objects", () => {
			expect(deepEqual({ a: { b: { c: 1 } } }, { a: { b: { c: 1 } } })).toBe(
				true,
			);
			expect(deepEqual({ a: { b: { c: 1 } } }, { a: { b: { c: 2 } } })).toBe(
				false,
			);
		});

		it("recurses into arrays of objects", () => {
			expect(deepEqual([{ a: 1 }, { a: 2 }], [{ a: 1 }, { a: 2 }])).toBe(true);
			expect(deepEqual([{ a: 1 }, { a: 2 }], [{ a: 1 }, { a: 3 }])).toBe(false);
		});

		it("recurses into nested arrays", () => {
			expect(
				deepEqual(
					[
						[1, 2],
						[3, 4],
					],
					[
						[1, 2],
						[3, 4],
					],
				),
			).toBe(true);
			expect(
				deepEqual(
					[
						[1, 2],
						[3, 4],
					],
					[
						[1, 2],
						[3, 5],
					],
				),
			).toBe(false);
		});

		it("forwards unsupportedHandling into array elements", () => {
			const fn = () => undefined;
			expect(() => deepEqual([fn], [fn])).toThrow(/Unsupported data type/);
			expect(deepEqual([fn], [fn], "ignore")).toBe(true);
			expect(deepEqual([fn], [fn], "equals")).toBe(true);
		});
	});

	describe("unsupportedHandling", () => {
		it("throws by default for unsupported types (function)", () => {
			const fn = () => undefined;
			expect(() => deepEqual(fn, fn)).toThrow(/Unsupported data type/);
		});

		it("returns true for unsupported types when set to 'ignore'", () => {
			const fn = () => undefined;
			expect(deepEqual(fn, fn, "ignore")).toBe(true);
			expect(deepEqual(fn, () => 1, "ignore")).toBe(true);
		});

		it("falls back to === when set to 'equals'", () => {
			const fn = () => undefined;
			expect(deepEqual(fn, fn, "equals")).toBe(true);
			expect(deepEqual(fn, () => undefined, "equals")).toBe(false);
		});
	});
});
