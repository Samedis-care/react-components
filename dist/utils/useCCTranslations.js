import { useTranslation } from "react-i18next";
import ccI18n from "../i18n";
/**
 * Internal helper for useTranslation hook
 */
const useCCTranslations = () => useTranslation("translation", {
    i18n: ccI18n,
});
/**
 * `useTranslation` for namespaces of components-care's own i18n instance
 * (`ComponentsCareI18n`), which follows its own current language:
 * `"translation"`, `"countries"`, `"currencies"`, `"languages"` and
 * `"locale-switcher"`. Suspends until the namespaces have loaded.
 * @param namespaces One namespace or several; with several, prefix the keys
 * of the others with their namespace (`t("countries:DE")`)
 */
export const useCCTranslationsNS = (namespaces) => useTranslation(namespaces, {
    i18n: ccI18n,
});
/**
 * Language names in components-care's current language, keyed by language
 * code: `t("de")` is "German" in English, "Deutsch" in German. The key
 * `<code>-native` names a language in that language. Suspends until the
 * names have loaded.
 */
export const useCCLanguagesTranslations = () => useTranslation("languages", {
    i18n: ccI18n,
});
/**
 * The locale switcher's entries, keyed by locale (`"de-DE"`): `country` and
 * `language` in components-care's current language, `native_country` and
 * `native_language` in the locale's own language (`t("de-DE.country")`).
 * Suspends until the entries have loaded.
 */
export const useCCLocaleSwitcherTranslations = () => useTranslation("locale-switcher", {
    i18n: ccI18n,
});
/**
 * Country names in components-care's current language, keyed by the codes of
 * `CountryCodes`: `t("DE")` is "Germany" in English, "Deutschland" in German.
 * UN M49 region codes are named too (`t("150")`: "Europe"). A flag shown
 * without the country's name is named this way by `<CountryFlag code named />`;
 * for a country select use `useCountryOptions()`. Suspends until the names have
 * loaded.
 */
export const useCCCountryTranslations = () => useTranslation("countries", {
    i18n: ccI18n,
});
/**
 * Currency names and symbols in components-care's current language, keyed by
 * ISO 4217 code: `t("EUR.displayName")` ("Euro"), `t("EUR.symbol")` ("€"),
 * `t("EUR.displayName", { count })` for the plural form. Suspends until the
 * names have loaded.
 */
export const useCCCurrencyTranslations = () => useTranslation("currencies", {
    i18n: ccI18n,
});
export default useCCTranslations;
