import { afterAll, describe, expect, it } from "vitest";
import ccI18n from "../../src/i18n";
import parseLocalizedNumber from "../../src/utils/parseLocalizedNumber";

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

			it.each([
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
});
