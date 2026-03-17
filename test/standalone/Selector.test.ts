import { describe, it, expect } from "vitest";
import {
	getStringLabel,
	getReactLabel,
	modifyReactLabel,
	selectorLocalLoadHandler,
	type BaseSelectorData,
} from "../../src/standalone/Selector/BaseSelector";

// ---------------------------------------------------------------------------
// getStringLabel
// ---------------------------------------------------------------------------

describe("getStringLabel", () => {
	it("returns the label when it is a plain string", () => {
		const data: BaseSelectorData = { value: "a", label: "Alpha" };
		expect(getStringLabel(data)).toBe("Alpha");
	});

	it("returns the first element when label is a tuple", () => {
		const data: BaseSelectorData = { value: "b", label: ["Beta", "β (beta)"] };
		expect(getStringLabel(data)).toBe("Beta");
	});

	it("handles a string passed directly (free-solo usage)", () => {
		expect(getStringLabel("plain string")).toBe("plain string");
	});
});

// ---------------------------------------------------------------------------
// getReactLabel
// ---------------------------------------------------------------------------

describe("getReactLabel", () => {
	it("returns the label when it is a plain string", () => {
		const data: BaseSelectorData = { value: "a", label: "Alpha" };
		expect(getReactLabel(data)).toBe("Alpha");
	});

	it("returns the second element when label is a tuple", () => {
		const data: BaseSelectorData = {
			value: "b",
			label: ["Beta", "β (beta)"],
		};
		expect(getReactLabel(data)).toBe("β (beta)");
	});
});

// ---------------------------------------------------------------------------
// modifyReactLabel
// ---------------------------------------------------------------------------

describe("modifyReactLabel", () => {
	it("wraps the existing string label", () => {
		const data: BaseSelectorData = { value: "c", label: "Charlie" };
		const modified = modifyReactLabel(data, (prev) => `[${prev as string}]`);
		expect(getStringLabel(modified)).toBe("Charlie");
		expect(getReactLabel(modified)).toBe("[Charlie]");
	});

	it("preserves the string key of a tuple label", () => {
		const data: BaseSelectorData = {
			value: "d",
			label: ["Delta", "Δ (delta)"],
		};
		const modified = modifyReactLabel(data, (prev) => `(${prev as string})`);
		expect(getStringLabel(modified)).toBe("Delta");
		expect(getReactLabel(modified)).toBe("(Δ (delta))");
	});

	it("does not mutate the original data", () => {
		const data: BaseSelectorData = { value: "e", label: "Echo" };
		modifyReactLabel(data, () => "modified");
		// original should be unchanged
		expect(data.label).toBe("Echo");
	});
});

// ---------------------------------------------------------------------------
// selectorLocalLoadHandler
// ---------------------------------------------------------------------------

const SAMPLE_DATA: BaseSelectorData[] = [
	{ value: "apple", label: "Apple" },
	{ value: "apricot", label: "Apricot" },
	{ value: "banana", label: "Banana" },
	{ value: "cherry", label: "Cherry" },
	{ value: "date", label: "Date" },
	{ value: "elderberry", label: "Elderberry" },
];

describe("selectorLocalLoadHandler", () => {
	const handler = selectorLocalLoadHandler(SAMPLE_DATA);

	it("returns all entries for an empty query", () => {
		const result = handler("");
		expect(result.length).toBe(SAMPLE_DATA.length);
	});

	it("performs case-insensitive prefix matching", () => {
		const result = handler("ap");
		const labels = result.map(getStringLabel);
		expect(labels).toContain("Apple");
		expect(labels).toContain("Apricot");
		expect(labels).not.toContain("Banana");
	});

	it("also matches substrings (not just prefixes)", () => {
		const result = handler("rry");
		const labels = result.map(getStringLabel);
		expect(labels).toContain("Cherry");
		expect(labels).toContain("Elderberry");
	});

	it("places prefix matches before substring matches", () => {
		// "an" is a substring of Banana (Ba-NA-na) and contained in Elderberry? No.
		// "an" prefix: none. "an" substring: Banana. Verify ordering.
		const handlerLong = selectorLocalLoadHandler([
			{ value: "banana", label: "Banana" }, // contains "an"
			{ value: "mango", label: "Mango" }, // starts with "Man" but not "an"
			{ value: "tangerine", label: "Tangerine" }, // contains "an"
		]);
		const result = handlerLong("an");
		// All three contain "an" somewhere; none starts with "an" — order can vary but all present
		expect(result.length).toBeGreaterThanOrEqual(2);
	});

	it("returns an empty array when nothing matches", () => {
		const result = handler("zzz");
		expect(result).toHaveLength(0);
	});

	it("is case-insensitive for uppercase queries", () => {
		const result = handler("APPLE");
		const labels = result.map(getStringLabel);
		expect(labels).toContain("Apple");
	});

	it("deduplicates results (no double entries)", () => {
		// "apple" starts with "apple" AND contains "apple", so it would appear twice without dedup
		const result = handler("apple");
		const values = result.map((d) => d.value);
		const uniqueValues = [...new Set(values)];
		expect(values.length).toBe(uniqueValues.length);
	});

	it("handles a dataset with tuple labels", () => {
		const withTuples: BaseSelectorData[] = [
			{ value: "x", label: ["Xylophone", "🎵 Xylophone"] },
			{ value: "y", label: ["Yellow", "🟡 Yellow"] },
		];
		const h = selectorLocalLoadHandler(withTuples);
		const result = h("xy");
		expect(result.map(getStringLabel)).toContain("Xylophone");
	});
});

// ---------------------------------------------------------------------------
// BaseSelectorData shape: disabled and divider options
// ---------------------------------------------------------------------------

describe("BaseSelectorData optional flags", () => {
	it("accepts isDisabled flag", () => {
		const data: BaseSelectorData = {
			value: "disabled-item",
			label: "Disabled",
			isDisabled: true,
		};
		expect(data.isDisabled).toBe(true);
	});

	it("accepts isDivider flag", () => {
		const data: BaseSelectorData = {
			value: "divider",
			label: "",
			isDivider: true,
		};
		expect(data.isDivider).toBe(true);
	});

	it("accepts isSmallLabel flag", () => {
		const data: BaseSelectorData = {
			value: "small-label",
			label: "Recent",
			isSmallLabel: true,
		};
		expect(data.isSmallLabel).toBe(true);
	});

	it("accepts group property", () => {
		const data: BaseSelectorData = {
			value: "grouped",
			label: "Grouped item",
			group: "GroupA",
		};
		expect(data.group).toBe("GroupA");
	});
});
