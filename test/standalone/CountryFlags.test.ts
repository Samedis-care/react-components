import { afterEach, describe, it, expect } from "vitest";
import { createElement } from "react";
import { cleanup, render, within } from "@testing-library/react";
import CountryFlags from "../../src/standalone/CountryFlags";
import countryLanguages from "../../src/assets/data/country-languages.json";
import supportedLanguages from "../../src/assets/data/supported-languages.json";
import supportedLocales from "../../src/assets/data/supported-locales.json";
import flagAW from "../../src/assets/img/countries/AW.svg";
import LocaleSelectorEntry from "../../src/non-standalone/LocaleSelector/LocaleSelectorEntry";
import type { LocaleSelectorEntryData } from "../../src/non-standalone/LocaleSelector/LocaleSelectorDialogContent";

const lookup = (code: string): unknown =>
	(CountryFlags as Record<string, unknown>)[code];

describe("CountryFlags", () => {
	it("contains entries for well-known country codes", () => {
		const knownCodes = [
			"US",
			"DE",
			"GB",
			"FR",
			"JP",
			"CN",
			"AU",
			"CA",
			"BR",
			"IN",
		];
		for (const code of knownCodes) {
			expect(CountryFlags, `Missing flag for ${code}`).toHaveProperty(code);
		}
	});

	it("has no undefined or null values", () => {
		for (const [code, value] of Object.entries(CountryFlags)) {
			expect(value, `Flag for ${code} is falsy`).toBeTruthy();
		}
	});

	it("all values are strings", () => {
		for (const [code, value] of Object.entries(CountryFlags)) {
			expect(typeof value, `Flag for ${code} is not a string`).toBe("string");
		}
	});

	it("contains at least 200 country codes", () => {
		expect(Object.keys(CountryFlags).length).toBeGreaterThanOrEqual(200);
	});

	it("all keys are two-letter uppercase ISO codes", () => {
		for (const code of Object.keys(CountryFlags)) {
			expect(code).toMatch(/^[A-Z]{2}$/);
		}
	});

	describe("key set", () => {
		it("[ISSUE-3466-ITEM-2] returns undefined for names inherited from Object.prototype", () => {
			const inherited = [
				"toString",
				"constructor",
				"__proto__",
				"hasOwnProperty",
				"valueOf",
				"isPrototypeOf",
				"propertyIsEnumerable",
				"toLocaleString",
			];
			expect(inherited.filter((name) => lookup(name) !== undefined)).toEqual(
				[],
			);
		});

		it("[ISSUE-3466-ITEM-2] `in` finds the country codes, not names inherited from Object.prototype", () => {
			expect("DE" in CountryFlags).toBe(true);
			expect(
				["toString", "constructor", "__proto__", "hasOwnProperty"].filter(
					(name) => name in CountryFlags,
				),
			).toEqual([]);
		});

		it("[ISSUE-3466-ITEM-1] has a flag for the country of every LocaleSelector entry", () => {
			// the entries LocaleSelectorDialogContent lists without supportedLocales
			const entries = Object.entries(
				countryLanguages as Record<string, string[]>,
			).flatMap(([country, langs]) =>
				langs
					.filter((lang) => supportedLanguages.includes(lang))
					.map((lang) => lang + "-" + country),
			);
			expect(entries.length).toBeGreaterThan(0);
			expect(
				entries.filter(
					(locale) => !Object.hasOwn(CountryFlags, locale.split("-")[1]),
				),
			).toEqual([]);
		});

		it("[ISSUE-3466-ITEM-1] has a flag for the country of every locale with locale-switcher texts", () => {
			// supported-locales.json lists every locale the locale-switcher
			// translations name (sv-AX, sq-XK, ...): the rows the dialog shows once
			// their language ships in src/assets/i18n
			expect(supportedLocales.length).toBeGreaterThan(0);
			expect(
				supportedLocales.filter(
					(locale) => !Object.hasOwn(CountryFlags, locale.split("-")[1]),
				),
			).toEqual([]);
		});
	});

	describe("in LocaleSelectorEntry", () => {
		afterEach(cleanup);
		const germany: LocaleSelectorEntryData = {
			locale: "de-DE",
			language_short: "de",
			country_short: "DE",
			country: "Germany",
			language: "German",
			native_country: "Deutschland",
			native_language: "Deutsch",
		};
		const renderEntry = (locale: LocaleSelectorEntryData) =>
			render(
				createElement(LocaleSelectorEntry, {
					locale,
					currentLanguage: "en",
					handleSwitch: () => {},
					disabled: false,
				}),
			);

		it("[ISSUE-3466-ITEM-1] shows the flag of a country that is not in countries.json", () => {
			const aruba: LocaleSelectorEntryData = {
				locale: "nl-AW",
				language_short: "nl",
				country_short: "AW",
				country: "Aruba",
				language: "Dutch",
				native_country: "Aruba",
				native_language: "Nederlands",
			};
			const { container } = renderEntry(aruba);
			expect(flagAW).toBeTruthy();
			expect(container.querySelector("img")?.getAttribute("src")).toBe(flagAW);
		});

		it("[ISSUE-3466-ITEM-6] the flag next to the country name is decorative: empty alt, the row names the country once", () => {
			const { container } = renderEntry(germany);
			expect(container.querySelector("img")).toHaveAttribute("alt", "");
			expect(within(container).queryByRole("img")).toBeNull();
			expect(within(container).getByRole("button")).not.toHaveAccessibleName(
				/^Germany\s*Germany/,
			);
		});
	});
});
