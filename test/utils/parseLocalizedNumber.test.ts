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
		["en", "-", null],
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
