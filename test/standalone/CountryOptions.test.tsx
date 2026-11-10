import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import ccI18n from "../../src/i18n";
import countries from "../../src/assets/data/countries.json";
import countryNamesDe from "../../src/assets/i18n/de/countries.json";
import countryNamesEn from "../../src/assets/i18n/en/countries.json";
import CountryFlags from "../../src/standalone/CountryFlags";
// the tier indexes the package root re-exports (src/index.ts: export * from both)
import { CountryCodes, useCountryOptions } from "../../src/standalone";
import { useCCCountryTranslations } from "../../src/utils";

const labelsOf = (options: { label: string }[]) =>
	options.map((option) => option.label);

/** where the names are in the labels, -1 for a missing one */
const positions = (labels: string[], names: string[]) =>
	names.map((name) => labels.indexOf(name));
const ascending = (numbers: number[]) => [...numbers].sort((a, b) => a - b);

/** the pairs of neighbors that are out of order for the collator */
const unsorted = (labels: string[], locale: string): string[] => {
	const collator = new Intl.Collator(locale);
	return labels
		.slice(1)
		.map((label, index) => [labels[index], label])
		.filter(([a, b]) => collator.compare(a, b) > 0)
		.map(([a, b]) => `${a} > ${b}`);
};

beforeAll(async () => {
	await ccI18n.changeLanguage("de-DE");
	await ccI18n.loadNamespaces(["translation", "countries"]);
	await ccI18n.loadLanguages(["en"]);
});
afterAll(async () => {
	await ccI18n.changeLanguage("en-US");
});

describe("CountryCodes", () => {
	it("[ISSUE-3466-ITEM-9] is the code list of countries.json, from the package root, and cannot be changed", () => {
		expect(CountryCodes).toEqual(countries);
		expect(Object.isFrozen(CountryCodes)).toBe(true);
		// every code has a flag
		expect(
			CountryCodes.filter((code) => !Object.hasOwn(CountryFlags, code)),
		).toEqual([]);
	});
});

describe("useCountryOptions", () => {
	it("[ISSUE-3466-ITEM-9] lists every country once: its code as value, its name in the current language as label, its flag as icon", async () => {
		await act(() => ccI18n.changeLanguage("de-DE"));
		const { result } = renderHook(() => useCountryOptions());
		const options = result.current;
		expect(options.map((option) => option.value).sort()).toEqual(
			[...countries].sort(),
		);
		expect(
			options.filter(
				(option) =>
					option.label !==
						(countryNamesDe as Record<string, string>)[option.value] ||
					option.icon !== CountryFlags[option.value],
			),
		).toEqual([]);
		expect(options.find((option) => option.value === "DE")).toEqual({
			value: "DE",
			label: "Deutschland",
			icon: CountryFlags.DE,
		});
	});

	it("[ISSUE-3466-ITEM-9] sorts the options by name with the current language's collation", async () => {
		await act(() => ccI18n.changeLanguage("de-DE"));
		const { result } = renderHook(() => useCountryOptions());
		const labels = labelsOf(result.current);
		expect(labels[0]).toBe("Afghanistan");
		expect(unsorted(labels, "de-DE")).toEqual([]);
		// not code order (AD Andorra, AE Emirates, AF Afghanistan, ...), and the
		// German collation sorts Ä as A and Ö as O (code unit order puts them
		// after Z)
		const names = [
			"Afghanistan",
			"Ägypten",
			"Albanien",
			"Andorra",
			"Deutschland",
			"Oman",
			"Österreich",
			"Pakistan",
			"Schweiz",
			"Vereinigte Arabische Emirate",
		];
		expect(positions(labels, names)).not.toContain(-1);
		expect(positions(labels, names)).toEqual(
			ascending(positions(labels, names)),
		);
	});

	it("[ISSUE-3466-ITEM-9] renames and re-sorts when the language changes, and keeps the same array otherwise", async () => {
		await act(() => ccI18n.changeLanguage("de-DE"));
		const { result, rerender } = renderHook(() => useCountryOptions());
		const german = result.current;
		rerender();
		expect(result.current).toBe(german);

		await act(() => ccI18n.changeLanguage("en-US"));
		const labels = labelsOf(result.current);
		expect(result.current).not.toBe(german);
		expect(labels[0]).toBe("Afghanistan");
		expect(unsorted(labels, "en-US")).toEqual([]);
		expect(
			result.current.filter(
				(option) =>
					option.label !==
					(countryNamesEn as Record<string, string>)[option.value],
			),
		).toEqual([]);
		const names = ["Austria", "Egypt", "Germany", "Switzerland"];
		expect(positions(labels, names)).not.toContain(-1);
		expect(positions(labels, names)).toEqual(
			ascending(positions(labels, names)),
		);
	});
});

describe("useCCCountryTranslations", () => {
	it("[ISSUE-3466-ITEM-9] is exported from the package root and names a country in the current language", async () => {
		await act(() => ccI18n.changeLanguage("de-DE"));
		const { result } = renderHook(() => useCCCountryTranslations());
		expect(result.current.t("CH")).toBe("Schweiz");
	});
});
