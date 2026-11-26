import { describe, expect, it } from "vitest";
import isPlainObject from "../../src/utils/isPlainObject";

describe("isPlainObject", () => {
	it("[ISSUE-3496-ITEM-25] a record with an entry named constructor is a plain object", () => {
		expect(isPlainObject({ constructor: 1 })).toBe(true);
		expect(
			isPlainObject(JSON.parse('{"constructor":{"sort":1},"name":"x"}')),
		).toBe(true);
	});

	it("[ISSUE-3496-ITEM-25] a plain object is told by its prototype", () => {
		class Custom {
			value = 1;
		}
		expect(isPlainObject({})).toBe(true);
		expect(isPlainObject({ a: { b: 1 } })).toBe(true);
		expect(isPlainObject(Object.create(null))).toBe(true);

		expect(isPlainObject(null)).toBe(false);
		expect(isPlainObject(undefined)).toBe(false);
		expect(isPlainObject(1)).toBe(false);
		expect(isPlainObject("{}")).toBe(false);
		expect(isPlainObject([])).toBe(false);
		expect(isPlainObject(new Date())).toBe(false);
		expect(isPlainObject(new Map())).toBe(false);
		expect(isPlainObject(new Blob())).toBe(false);
		expect(isPlainObject(new Custom())).toBe(false);
		// inherits from an object, not from Object.prototype
		expect(isPlainObject(Object.create({ a: 1 }))).toBe(false);
	});
});
