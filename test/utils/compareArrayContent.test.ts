import { describe, expect, it } from "vitest";
import compareArrayContent from "../../src/utils/compareArrayContent";

describe("compareArrayContent", () => {
	it("[ISSUE-3494-ITEM-11] the same entries in any order are equal, falsy entries included, and every entry counts as often as it occurs", () => {
		const shared = { id: 1 };
		const cases: Array<[unknown[], unknown[], boolean]> = [
			[[], [], true],
			[["a", "b"], ["b", "a"], true],
			// falsy entries are entries like any other
			[[""], [""], true],
			[[0], [0], true],
			[[null, undefined, false], [false, null, undefined], true],
			[["", "a"], ["a", ""], true],
			[[""], ["a"], false],
			[[0], [""], false],
			[[NaN], [NaN], true],
			// every duplicate counts
			[["a", "a", "b"], ["a", "b", "b"], false],
			[["", "", "a"], ["", "a", "a"], false],
			[["a", "a"], ["a", "a"], true],
			[["a"], ["a", "b"], false],
			// entries compare by identity, not by content
			[[shared], [shared], true],
			[[{ id: 1 }], [{ id: 1 }], false],
		];
		for (const [a, b, equal] of cases) {
			expect(compareArrayContent(a, b), JSON.stringify([a, b])).toBe(equal);
			expect(compareArrayContent(b, a), JSON.stringify([b, a])).toBe(equal);
		}
	});
});
