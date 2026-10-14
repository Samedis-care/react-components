import { describe, expect, it } from "vitest";
import { dotOmit, dotsToObject, objectToDots } from "../../src/utils/dotUtils";

describe("objectToDots", () => {
	it("flattens nested plain objects into dot paths", () => {
		expect(objectToDots({ a: { b: { c: 1 } }, d: "x" })).toEqual({
			"a.b.c": 1,
			d: "x",
		});
	});

	it("keeps null and undefined values as leaves", () => {
		const dots = objectToDots({ a: null, b: undefined, c: { d: null } });
		expect(dots).toEqual({ a: null, b: undefined, "c.d": null });
		expect(Object.keys(dots)).toEqual(["a", "b", "c.d"]);
	});

	it("keeps empty objects as leaves", () => {
		expect(objectToDots({ a: {}, b: { c: {} } })).toEqual({
			a: {},
			"b.c": {},
		});
	});

	it("keeps everything that is not a plain object as it is", () => {
		class Custom {
			value = 1;
		}
		const source = {
			array: [{ a: 1 }],
			date: new Date(0),
			blob: new Blob(["x"]),
			custom: new Custom(),
		};

		const dots = objectToDots(source);
		expect(Object.keys(dots)).toEqual(Object.keys(source));
		for (const key of Object.keys(source) as (keyof typeof source)[])
			expect(dots[key]).toBe(source[key]);
	});
});

describe("dotsToObject", () => {
	it("restores what objectToDots flattened", () => {
		const source = {
			a: null,
			b: { c: null, d: "x", e: {} },
			f: [1, 2],
			g: new Date(0),
		};
		expect(dotsToObject(objectToDots(source))).toEqual(source);
	});
});

describe("dotOmit", () => {
	it("omits only the listed keys", () => {
		expect(dotOmit({ locked: null, permissions: null }, ["locked"])).toEqual({
			permissions: null,
		});
		expect(dotOmit({ locked: "x", sync: null }, ["locked"])).toEqual({
			sync: null,
		});
	});

	it("omits nested keys by dot path", () => {
		expect(dotOmit({ a: { b: 1, c: null }, d: [1] }, ["a.b"])).toEqual({
			a: { c: null },
			d: [1],
		});
	});

	it("does not modify the data", () => {
		const data = { a: { b: 1, c: 2 } };
		dotOmit(data, ["a.b"]);
		expect(data).toEqual({ a: { b: 1, c: 2 } });
	});
});
