import {
	afterAll,
	beforeAll,
	describe,
	expect,
	expectTypeOf,
	it,
} from "vitest";
import { act, renderHook } from "@testing-library/react";
import ccI18n from "../../src/i18n";
import { waitForCcI18n } from "../waitForCcI18n";
import countries from "../../src/assets/data/countries.json";
import countryNamesDe from "../../src/assets/i18n/de/countries.json";
import countryNamesEn from "../../src/assets/i18n/en/countries.json";
import cldrCodeMappings from "cldr-core/supplemental/codeMappings.json";
import cldrAliases from "cldr-core/supplemental/aliases.json";
// the tier indexes the package root re-exports (src/index.ts: export * from both)
import {
	CountryCodes,
	CountryFlag,
	isCountryCode,
	loadCountryFlag,
	loadCountryFlags,
	useCountryOptions,
} from "../../src/standalone";
import type { CountryCode } from "../../src/standalone";
import { useCCCountryTranslations } from "../../src/utils";

const CountryFlags = await loadCountryFlags();

/**
 * The codes ISO 3166-1 assigns to a country or territory, in code order, from
 * CLDR's code mappings: a code with an ISO numeric code (the user-assigned
 * codes, such as Kosovo's XK and the EU's EU, have one of 900-999) that is not
 * withdrawn (AN, YU, ... are deprecated aliases in CLDR)
 */
const deprecatedCodes = cldrAliases.supplemental.metadata.alias.territoryAlias;
const isoCountries = Object.entries(cldrCodeMappings.supplemental.codeMappings)
	.filter(
		([code, mapping]) =>
			/^[A-Z]{2}$/.test(code) &&
			"_numeric" in mapping &&
			Number(mapping._numeric) < 900 &&
			!Object.hasOwn(deprecatedCodes, code),
	)
	.map(([code]) => code)
	.sort();

/** the ISO 3166-1 countries and territories the UN list left out */
const formerlyMissing = [
	"AW",
	"AX",
	"BL",
	"BV",
	"CC",
	"CW",
	"CX",
	"EH",
	"HM",
	"MF",
	"NC",
	"NF",
	"PF",
	"SJ",
	"SX",
];

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
	await waitForCcI18n(["translation", "countries"]);
	await ccI18n.changeLanguage("de-DE");
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

	it("[ISSUE-3466-ITEM-7] lists every country and territory ISO 3166-1 assigns a code to, Aruba, Curaçao and Sint Maarten included, in code order", () => {
		expect(isoCountries).toHaveLength(249);
		expect(
			formerlyMissing.filter((code) => !isoCountries.includes(code)),
		).toEqual([]);
		expect([...CountryCodes]).toEqual(isoCountries);
		// Kosovo's code is user-assigned, not an ISO 3166-1 code: it has a flag and
		// a name (the language dialog shows sq-XK), but no country select offers it
		expect(CountryCodes).not.toContain("XK");
		expect(isCountryCode("XK")).toBe(true);
	});

	it("[ISSUE-3466-ITEM-7] has a flag for every country it lists, Bouvet Island and Heard & McDonald Islands included", async () => {
		expectTypeOf<"BV" | "HM" | "CW" | "XK">().toExtend<CountryCode>();
		const flags = await Promise.all(formerlyMissing.map(loadCountryFlag));
		expect(formerlyMissing.filter((_, index) => !flags[index])).toEqual([]);
		expect(
			CountryCodes.filter((code) => !Object.hasOwn(CountryFlags, code)),
		).toEqual([]);
	});
});

describe("useCountryOptions", () => {
	it("[ISSUE-3466-ITEM-9] lists every country once: its code as value, its name in the current language as label, its CountryFlag as icon", async () => {
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
					(option.icon.props as { code?: string }).code !== option.value,
			),
		).toEqual([]);
		const germany = options.find((option) => option.value === "DE");
		expect(germany).toMatchObject({ value: "DE", label: "Deutschland" });
		expect(germany?.icon.type).toBe(CountryFlag);
		expect(germany?.icon.props).toEqual({ code: "DE" });
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

describe("useCountryOptions, every ISO 3166-1 country", () => {
	it("[ISSUE-3466-ITEM-7] offers Curaçao, Aruba, Sint Maarten, New Caledonia, French Polynesia and Åland by name", async () => {
		await act(() => ccI18n.changeLanguage("en-US"));
		const { result } = renderHook(() => useCountryOptions());
		const labels = labelsOf(result.current);
		const names = [
			"Curaçao",
			"Aruba",
			"Sint Maarten",
			"New Caledonia",
			"French Polynesia",
			"Åland Islands",
		];
		expect(names.filter((name) => !labels.includes(name))).toEqual([]);
		expect(result.current).toHaveLength(249);
	});
});

describe("useCCCountryTranslations", () => {
	it("[ISSUE-3466-ITEM-9] is exported from the package root and names a country in the current language", async () => {
		await act(() => ccI18n.changeLanguage("de-DE"));
		const { result } = renderHook(() => useCCCountryTranslations());
		expect(result.current.t("CH")).toBe("Schweiz");
	});
});
