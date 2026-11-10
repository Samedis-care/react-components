import { UseTranslationResponse } from "react-i18next";
import { FlatNamespace } from "i18next";
/**
 * Internal helper for useTranslation hook
 */
declare const useCCTranslations: () => UseTranslationResponse<"translation", undefined>;
/**
 * `useTranslation` for namespaces of components-care's own i18n instance
 * (`ComponentsCareI18n`), which follows its own current language:
 * `"translation"`, `"countries"`, `"currencies"`, `"languages"` and
 * `"locale-switcher"`. Suspends until the namespaces have loaded.
 * @param namespaces One namespace or several; with several, prefix the keys
 * of the others with their namespace (`t("countries:DE")`)
 */
export declare const useCCTranslationsNS: <N extends FlatNamespace | FlatNamespace[]>(namespaces: N) => UseTranslationResponse<N, undefined>;
/**
 * Language names in components-care's current language, keyed by language
 * code: `t("de")` is "German" in English, "Deutsch" in German. The key
 * `<code>-native` names a language in that language. Suspends until the
 * names have loaded.
 */
export declare const useCCLanguagesTranslations: () => UseTranslationResponse<"languages", undefined>;
/**
 * The locale switcher's entries, keyed by locale (`"de-DE"`): `country` and
 * `language` in components-care's current language, `native_country` and
 * `native_language` in the locale's own language (`t("de-DE.country")`).
 * Suspends until the entries have loaded.
 */
export declare const useCCLocaleSwitcherTranslations: () => UseTranslationResponse<"locale-switcher", undefined>;
/**
 * Country names in components-care's current language, keyed by the codes of
 * `CountryCodes`: `t("DE")` is "Germany" in English, "Deutschland" in German.
 * UN M49 region codes are named too (`t("150")`: "Europe"). A flag shown
 * without the country's name is named this way by `<CountryFlag code named />`;
 * for a country select use `useCountryOptions()`. Suspends until the names have
 * loaded.
 */
export declare const useCCCountryTranslations: () => UseTranslationResponse<"countries", undefined>;
/**
 * Currency names and symbols in components-care's current language, keyed by
 * ISO 4217 code: `t("EUR.displayName")` ("Euro"), `t("EUR.symbol")` ("€"),
 * `t("EUR.displayName", { count })` for the plural form. Suspends until the
 * names have loaded.
 */
export declare const useCCCurrencyTranslations: () => UseTranslationResponse<"currencies", undefined>;
export default useCCTranslations;
