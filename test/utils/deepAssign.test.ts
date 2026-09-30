import { describe, expect, it } from "vitest";
import deepAssign from "../../src/utils/deepAssign";

describe("deepAssign", () => {
	it("merges nested plain objects into the target's own", () => {
		const target = { a: { b: 1, c: 1 } };
		const own = target.a;

		deepAssign(target, { a: { c: 2 } });
		expect(target).toEqual({ a: { b: 1, c: 2 } });
		expect(target.a).toBe(own);
	});

	it("assigns everything else as it is, like Object.assign", () => {
		class Custom {
			value = 1;
		}
		const source = {
			object: { a: 1 },
			array: [{ a: 1 }],
			date: new Date(0),
			blob: new Blob(["x"]),
			custom: new Custom(),
			fn: () => 1,
		};

		const target = deepAssign({ object: "text" }, source);
		for (const key of Object.keys(source) as (keyof typeof source)[])
			expect(target[key]).toBe(source[key]);
	});
});
