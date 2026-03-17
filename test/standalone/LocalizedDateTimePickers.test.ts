import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// Locale mapping tested via getLocaleData (extracted inline for unit testing)
// The useMuiLocaleData hook depends on i18next + React, so we test the pure
// language → locale-object mapping logic independently.
// ---------------------------------------------------------------------------

import { deDE, enUS, frFR, nlNL, ruRU } from "@mui/x-date-pickers/locales";
import type { LocalizationProviderProps } from "@mui/x-date-pickers";

const extractLocaleData = (
	locale: typeof enUS | typeof deDE | typeof frFR | typeof nlNL | typeof ruRU,
): LocalizationProviderProps<never>["localeText"] =>
	locale.components.MuiLocalizationProvider.defaultProps.localeText;

const getLocaleData = (
	language: string,
): LocalizationProviderProps<never>["localeText"] => {
	switch (language) {
		case "en":
			return extractLocaleData(enUS);
		case "de":
			return extractLocaleData(deDE);
		case "fr":
			return extractLocaleData(frFR);
		case "nl":
			return extractLocaleData(nlNL);
		case "ru":
			return extractLocaleData(ruRU);
		default:
			return extractLocaleData(enUS);
	}
};

describe("locale mapping (useMuiLocaleData logic)", () => {
	it("returns enUS locale data for language 'en'", () => {
		const result = getLocaleData("en");
		const expected = extractLocaleData(enUS);
		expect(result).toEqual(expected);
	});

	it("returns deDE locale data for language 'de'", () => {
		const result = getLocaleData("de");
		const expected = extractLocaleData(deDE);
		expect(result).toEqual(expected);
	});

	it("returns frFR locale data for language 'fr'", () => {
		const result = getLocaleData("fr");
		const expected = extractLocaleData(frFR);
		expect(result).toEqual(expected);
	});

	it("returns nlNL locale data for language 'nl'", () => {
		const result = getLocaleData("nl");
		const expected = extractLocaleData(nlNL);
		expect(result).toEqual(expected);
	});

	it("returns ruRU locale data for language 'ru'", () => {
		const result = getLocaleData("ru");
		const expected = extractLocaleData(ruRU);
		expect(result).toEqual(expected);
	});

	it("falls back to enUS for an unsupported language", () => {
		const result = getLocaleData("zh");
		const expected = extractLocaleData(enUS);
		expect(result).toEqual(expected);
	});

	it("falls back to enUS for an empty language string", () => {
		const result = getLocaleData("");
		const expected = extractLocaleData(enUS);
		expect(result).toEqual(expected);
	});

	it("de locale is different from en locale", () => {
		const de = getLocaleData("de");
		const en = getLocaleData("en");
		// The objects themselves differ (different localized strings)
		expect(de).not.toEqual(en);
	});

	it("fr locale is different from en locale", () => {
		const fr = getLocaleData("fr");
		const en = getLocaleData("en");
		expect(fr).not.toEqual(en);
	});

	it("all supported locales return an object with keys", () => {
		const languages = ["en", "de", "fr", "nl", "ru"];
		for (const lang of languages) {
			const data = getLocaleData(lang);
			expect(data).toBeDefined();
			expect(typeof data).toBe("object");
			expect(Object.keys(data ?? {}).length).toBeGreaterThan(0);
		}
	});

	it("region part of a locale tag is stripped correctly (simulated)", () => {
		// The hook does: const [language] = i18n.language.split("-")
		// Simulate "de-AT" → "de"
		const fullTag = "de-AT";
		const [language] = fullTag.split("-");
		const result = getLocaleData(language);
		const expected = extractLocaleData(deDE);
		expect(result).toEqual(expected);
	});
});

// ---------------------------------------------------------------------------
// Smoke test: the MUI locale objects export the expected shape
// ---------------------------------------------------------------------------

describe("MUI locale object shape", () => {
	const locales = [
		{ name: "enUS", locale: enUS },
		{ name: "deDE", locale: deDE },
		{ name: "frFR", locale: frFR },
		{ name: "nlNL", locale: nlNL },
		{ name: "ruRU", locale: ruRU },
	];

	for (const { name, locale } of locales) {
		it(`${name} has MuiLocalizationProvider.defaultProps.localeText`, () => {
			const localeText =
				locale.components.MuiLocalizationProvider.defaultProps.localeText;
			expect(localeText).toBeDefined();
			expect(typeof localeText).toBe("object");
		});
	}
});
