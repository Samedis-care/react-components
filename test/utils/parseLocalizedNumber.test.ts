import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import ccI18n from "../../src/i18n";
import parseLocalizedNumber from "../../src/utils/parseLocalizedNumber";
import getNumberSeparator from "../../src/utils/getNumberSeparator";

const initialLanguage = ccI18n.language;

afterAll(async () => {
	await ccI18n.changeLanguage(initialLanguage);
});

const EUR: Intl.NumberFormatOptions = { style: "currency", currency: "EUR" };

// [value, options, expected]
const CASES: Record<
	string,
	[string, Intl.NumberFormatOptions | undefined, number | null][]
> = {
	"de-DE": [
		["", undefined, null],
		["7,5", undefined, 7.5],
		// a keypad offering the separator of another region
		["7.5", undefined, 7.5],
		["19.99", undefined, 19.99],
		["7.5 €", EUR, 7.5],
		// can't be group separators
		["0.500", undefined, 0.5],
		["1234.5", undefined, 1234.5],
		["1.2345", undefined, 1.2345],
		// group separators as the locale formats them
		["1.234", undefined, 1234],
		["12.345", undefined, 12345],
		["1.234.567", undefined, 1234567],
		["1.234,5", undefined, 1234.5],
		["1.234,00 €", EUR, 1234],
	],
	"en-US": [
		["7.5", undefined, 7.5],
		["7,5", undefined, 7.5],
		["7,50", undefined, 7.5],
		["1,234", undefined, 1234],
		["1,234.5", undefined, 1234.5],
		["1,234,567", undefined, 1234567],
	],
	"fr-FR": [
		["7,5", undefined, 7.5],
		["7.5", undefined, 7.5],
		// fr doesn't group with .
		["1.500", undefined, 1.5],
		["1 234,5", undefined, 1234.5],
	],
};

describe("parseLocalizedNumber", () => {
	for (const [locale, cases] of Object.entries(CASES)) {
		describe(locale, () => {
			it.each(cases)("parses %j", async (value, options, expected) => {
				await ccI18n.changeLanguage(locale);
				expect(parseLocalizedNumber(value, options)).toBe(expected);
			});

			it.each<[Intl.NumberFormatOptions | undefined]>([
				[undefined],
				[EUR],
				[{ maximumFractionDigits: 0 }],
				[{ style: "currency", currency: "JPY" }],
			])("reads back what the locale formats with %j", async (options) => {
				await ccI18n.changeLanguage(locale);
				for (const num of [
					5, 1234, 12345, 123456, 1234567, 1.5, 0.25, 1234.5, 1234567.25,
				]) {
					const formatted = num.toLocaleString(locale, options);
					expect(parseLocalizedNumber(formatted, options), formatted).toBe(
						parseFloat(
							num.toFixed(
								new Intl.NumberFormat(locale, options).resolvedOptions()
									.maximumFractionDigits,
							),
						),
					);
				}
			});
		});
	}
	// the number inputs commit what they show, so every language CC offers must
	// read its own grouped numbers back
	const GROUPED = [10000, 12345, 99999, 123456, 1234567.5];
	it.each(["ru", "fr", "de", "uz", "en", "nl", "de-AT", "de-CH", "it-CH"])(
		"reads back the grouped numbers %s formats",
		async (locale) => {
			await ccI18n.changeLanguage(locale);
			for (const num of GROUPED) {
				const formatted = num.toLocaleString(locale);
				expect(parseLocalizedNumber(formatted), formatted).toBe(num);
			}
		},
	);
	// es and it leave 4-digit numbers ungrouped (minimumGroupingDigits 2)
	it.each(["es", "es-ES", "it", "it-IT"])(
		"[ISSUE-3484-ITEM-1] reads back the grouped numbers %s formats",
		async (locale) => {
			await ccI18n.changeLanguage(locale);
			for (const num of GROUPED) {
				const formatted = num.toLocaleString(locale);
				expect(parseLocalizedNumber(formatted), formatted).toBe(num);
			}
		},
	);
	it.each([
		"ru",
		"fr",
		"de",
		"it",
		"es",
		"uz",
		"en",
		"nl",
		"de-AT",
		"de-CH",
		"it-CH",
		"nl-BE",
	])(
		"[ISSUE-3484-ITEM-3] reads back the negative numbers %s formats",
		async (locale) => {
			await ccI18n.changeLanguage(locale);
			for (const options of [undefined, EUR]) {
				for (const num of [-5, -0.25, -1234.5, -12345, -1234567.25]) {
					const formatted = num.toLocaleString(locale, options);
					expect(parseLocalizedNumber(formatted, options), formatted).toBe(num);
				}
			}
		},
	);

	it.each<[string, string, number | null]>([
		["fr", "\u22121 234,5", -1234.5],
		["en", "-.", NaN],
		["en", "-0", 0],
		["en", "-0.00", 0],
		["en", "5-", 5],
		["en", "€-5", -5],
	])(
		"[ISSUE-3484-ITEM-3] reads %s text %j as %j",
		async (locale, text, expected) => {
			await ccI18n.changeLanguage(locale);
			expect(parseLocalizedNumber(text)).toBe(expected);
		},
	);

	it.each<[string, string, number | null, Intl.NumberFormatOptions?]>([
		// several . and , that don't fit the locale's format
		["de", "1.234.5", NaN],
		["de", "1.234.5 €", NaN, EUR],
		["de", "1,234.5", NaN],
		["de", "1,234,567", NaN],
		["de", "7.5.", NaN],
		["de", "1.234.", NaN],
		["de", "1.23.456", NaN],
		["de", "0.123.456", NaN],
		["en", "1,234,5", NaN],
		["en", "1.234,5", NaN],
		["en", "1.234.567", NaN],
		["en", "7.5.", NaN],
		["fr", "1.234.567", NaN],
		["fr", "1.234,5", NaN],
		["en-IN", "1,234,567", NaN],
		// several that do
		["de", "1.234,5", 1234.5],
		["de", "1.234.567", 1234567],
		["de", "-1.234.567,25 €", -1234567.25, EUR],
		["de", "1.234,", 1234],
		["en", "1,234.5", 1234.5],
		["en", "1,234,567", 1234567],
		["en-IN", "12,34,567.5", 1234567.5],
		// a single one keeps its rule
		["de", "1.234", 1234],
		["en", "1.234", 1.234],
	])(
		"[ISSUE-3484-ITEM-5] reads %s text %j as %s",
		async (locale, text, expected, options) => {
			await ccI18n.changeLanguage(locale);
			expect(parseLocalizedNumber(text, options)).toBe(expected);
		},
	);

	it.each<[string, string, number | null, Intl.NumberFormatOptions?]>([
		// text without a digit is no number
		["en", "abc", NaN],
		["en", "abc", NaN, EUR],
		["de", "x €", NaN, EUR],
		["en", "EUR", NaN, EUR],
		["en", "%", NaN],
		["en", "-", NaN],
		["en", "-€", NaN, EUR],
		["de", "..", NaN],
		// unless nothing but blanks and the format's own symbols are left
		["en", "", null],
		["en", " \u00a0", null],
		["en", "€", null, EUR],
		["de", " €", null, EUR],
		["nl", "€\u00a0", null, EUR],
		["de-CH", "CHF", null, { style: "currency", currency: "CHF" }],
		["uz", "soʻm", null, { style: "currency", currency: "UZS" }],
		["en", "Cg.", null, { style: "currency", currency: "XCG" }],
		["en", "%", null, { style: "percent" }],
		["de", "kg", null, { style: "unit", unit: "kilogram" }],
	])(
		"[ISSUE-3484-ITEM-21] reads %s text %j without a digit as %s",
		async (locale, text, expected, options) => {
			await ccI18n.changeLanguage(locale);
			expect(parseLocalizedNumber(text, options)).toBe(expected);
		},
	);
	// the Caribbean guilder's symbol "Cg." contains a dot, the decimal separator of en
	const XCG: Intl.NumberFormatOptions = { style: "currency", currency: "XCG" };
	it.each(["de", "en", "es", "fr", "it", "nl", "ru", "uz", "en-IN"])(
		"[ISSUE-3484-ITEM-11] reads back the XCG amounts %s formats",
		async (locale) => {
			await ccI18n.changeLanguage(locale);
			for (const num of [5, 0.5, 1234.5, -1234.5, 1234567.25]) {
				const formatted = num.toLocaleString(locale, XCG);
				expect(parseLocalizedNumber(formatted, XCG), formatted).toBe(num);
			}
		},
	);

	it.each<[string, string, number | null]>([
		// the symbol typed without the blank, or after the number
		["en", "Cg.5", 5],
		["en", "Cg.1,234.5", 1234.5],
		["en", "5 Cg.", 5],
		["en", "Cg. -5", -5],
		["nl", "Cg.1.234,5", 1234.5],
	])(
		"[ISSUE-3484-ITEM-11] reads %s text %j in XCG as %s",
		async (locale, text, expected) => {
			await ccI18n.changeLanguage(locale);
			expect(parseLocalizedNumber(text, XCG)).toBe(expected);
		},
	);
	const PERCENT: Intl.NumberFormatOptions = {
		style: "percent",
		maximumFractionDigits: 1,
	};

	it.each<[string, string, number | null, Intl.NumberFormatOptions]>([
		["en", "75%", 0.75, PERCENT],
		// the percent sign may be left out
		["en", "75", 0.75, PERCENT],
		["en", "-5%", -0.05, PERCENT],
		["en", "-0%", 0, PERCENT],
		["en", "1,234.5%", 12.345, PERCENT],
		// the number closest to the typed one, which 1.1 / 100 is not
		["en", "1.1%", 0.011, PERCENT],
		["de", "75\u00a0%", 0.75, PERCENT],
		["de", "12,5 %", 0.125, PERCENT],
		["de", "1.234.5 %", NaN, PERCENT],
		["en", "%", null, PERCENT],
		// a percent unit shows the number itself
		["en", "75%", 75, { style: "unit", unit: "percent" }],
	])(
		"[ISSUE-3484-ITEM-9] reads %s text %j as %s",
		async (locale, text, expected, options) => {
			await ccI18n.changeLanguage(locale);
			expect(parseLocalizedNumber(text, options)).toBe(expected);
		},
	);
	it.each(["ru", "fr", "de", "it", "es", "uz", "en", "nl", "de-CH"])(
		"[ISSUE-3484-ITEM-9] reads back the percentages %s formats",
		async (locale) => {
			await ccI18n.changeLanguage(locale);
			for (const num of [0, 0.05, 0.75, 0.125, 1.5, 12.345, -0.25, 1234.567]) {
				const formatted = num.toLocaleString(locale, PERCENT);
				expect(parseLocalizedNumber(formatted, PERCENT), formatted).toBe(num);
			}
		},
	);
});

describe("getNumberSeparator", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	/** the group separator as the locale shows it in a number it always groups */
	const groupOf = (locale: string, options?: Intl.NumberFormatOptions) =>
		new Intl.NumberFormat(locale, { ...options, useGrouping: true })
			.formatToParts(1234567)
			.find((part) => part.type === "group")!.value;

	// es, it, it-CH and ru-UA show 1234 ungrouped
	it.each(["es", "it", "it-CH", "ru-UA", "de", "en"])(
		"[ISSUE-3484-ITEM-1] gives the group separator of %s, also with options that show no grouping or no fraction digits",
		async (locale) => {
			await ccI18n.changeLanguage(locale);
			const JPY: Intl.NumberFormatOptions = {
				style: "currency",
				currency: "JPY",
			};
			expect(getNumberSeparator("group")).toBe(groupOf(locale));
			expect(getNumberSeparator("group", { useGrouping: false })).toBe(
				groupOf(locale),
			);
			expect(getNumberSeparator("group", JPY)).toBe(groupOf(locale, JPY));
		},
	);

	it('[ISSUE-3484-ITEM-1] gives the group separator of es and it in an engine without useGrouping "always"', async () => {
		const NumberFormat = Intl.NumberFormat;
		// engines before Intl.NumberFormat v3 take "always" as true, which there
		// means the locale's own grouping ("auto" today)
		vi.spyOn(Intl, "NumberFormat").mockImplementation(
			function NumberFormatV1(locales, options) {
				return new NumberFormat(locales, {
					...options,
					useGrouping:
						options?.useGrouping === "always" ? "auto" : options?.useGrouping,
				});
			},
		);
		for (const locale of ["es", "it"]) {
			await ccI18n.changeLanguage(locale);
			expect(getNumberSeparator("group"), locale).toBe(".");
			expect(parseLocalizedNumber("12.345"), locale).toBe(12345);
		}
	});
});
