import { afterEach, describe, it, expect } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";

// ---------------------------------------------------------------------------
// useMuiLocaleData: the components-care language → the MUI picker texts handed
// to the pickers' LocalizationProvider. Driven through the library's own i18next
// instance, which is what the hook reads.
// ---------------------------------------------------------------------------

import {
	deDE,
	enUS,
	esES,
	frFR,
	itIT,
	nlNL,
	ruRU,
} from "@mui/x-date-pickers/locales";
import * as muiLocales from "@mui/x-date-pickers/locales";
import ccI18n, { langs } from "../../src/i18n";
import useMuiLocaleData from "../../src/standalone/LocalizedDateTimePickers/useMuiLocaleData";

type MuiLocale = typeof enUS;

const extractLocaleData = (locale: MuiLocale) =>
	locale.components.MuiLocalizationProvider.defaultProps.localeText;

const switchLanguage = async (language: string) => {
	await act(async () => {
		await ccI18n.changeLanguage(language);
	});
};

/** The picker texts the hook returns for a library language */
const getLocaleData = async (language: string) => {
	await switchLanguage(language);
	return renderHook(() => useMuiLocaleData()).result.current;
};

afterEach(async () => {
	cleanup();
	await switchLanguage("en");
});

describe("useMuiLocaleData", () => {
	it("returns enUS locale data for language 'en'", async () => {
		expect(await getLocaleData("en")).toBe(extractLocaleData(enUS));
	});

	it("returns deDE locale data for language 'de'", async () => {
		expect(await getLocaleData("de")).toBe(extractLocaleData(deDE));
	});

	it("returns frFR locale data for language 'fr'", async () => {
		expect(await getLocaleData("fr")).toBe(extractLocaleData(frFR));
	});

	it("returns nlNL locale data for language 'nl'", async () => {
		expect(await getLocaleData("nl")).toBe(extractLocaleData(nlNL));
	});

	it("returns ruRU locale data for language 'ru'", async () => {
		expect(await getLocaleData("ru")).toBe(extractLocaleData(ruRU));
	});

	// compared by one text, so a failure names the language that came out
	it("[ISSUE-3474-ITEM-7] returns itIT locale data for language 'it'", async () => {
		expect((await getLocaleData("it"))?.previousMonth).toBe(
			extractLocaleData(itIT)?.previousMonth,
		);
	});

	it("[ISSUE-3474-ITEM-7] returns esES locale data for language 'es'", async () => {
		expect((await getLocaleData("es"))?.previousMonth).toBe(
			extractLocaleData(esES)?.previousMonth,
		);
	});

	// MUI's texts for a language: every MUI locale named after it (ptBR, ptPT, …)
	const muiLocaleDataOf = (language: string) =>
		Object.entries(muiLocales)
			.filter(([name]) => new RegExp(`^${language}[A-Z]{2}$`).test(name))
			.map(([, locale]) => extractLocaleData(locale as MuiLocale));

	// a language added to supported-languages.json fails here until the hook maps it
	it.each(langs)(
		"[ISSUE-3474-ITEM-7] library language %s gets MUI's picker texts when MUI ships them",
		async (language) => {
			const own = muiLocaleDataOf(language);
			const result = await getLocaleData(language);
			if (own.length === 0) expect(result).toBe(extractLocaleData(enUS));
			else expect(own).toContain(result);
		},
	);

	it("falls back to enUS for a library language MUI has no texts for", async () => {
		expect(await getLocaleData("uz")).toBe(extractLocaleData(enUS));
	});

	it("falls back to enUS for an unsupported language", async () => {
		expect(await getLocaleData("zh")).toBe(extractLocaleData(enUS));
	});

	it("falls back to enUS in i18next's cimode", async () => {
		expect(await getLocaleData("cimode")).toBe(extractLocaleData(enUS));
	});

	it.each([
		["de-AT", deDE],
		["de_DE", deDE],
		["fr-CA", frFR],
	] as const)(
		"region part of the locale tag %s is stripped",
		async (tag, locale) => {
			expect(await getLocaleData(tag)).toBe(extractLocaleData(locale));
		},
	);

	it("follows a language change without a remount", async () => {
		const { result } = renderHook(() => useMuiLocaleData());
		expect(result.current).toBe(extractLocaleData(enUS));
		await switchLanguage("de");
		expect(result.current).toBe(extractLocaleData(deDE));
	});

	it("keeps the same object while the language stays", () => {
		const { result, rerender } = renderHook(() => useMuiLocaleData());
		const first = result.current;
		rerender();
		expect(result.current).toBe(first);
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
