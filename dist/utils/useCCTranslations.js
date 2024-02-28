import { useTranslation } from "react-i18next";
import ccI18n from "../i18n";
/**
 * Internal helper for useTranslation hook
 */
const useCCTranslations = () => useTranslation("translation", {
    i18n: ccI18n,
});
export const useCCTranslationsNS = (namespaces) => useTranslation(namespaces, {
    i18n: ccI18n,
});
export const useCCLanguagesTranslations = () => useTranslation("languages", {
    i18n: ccI18n,
});
export const useCCLocaleSwitcherTranslations = () => useTranslation("locale-switcher", {
    i18n: ccI18n,
});
export const useCCCountryTranslations = () => useTranslation("countries", {
    i18n: ccI18n,
});
export const useCCCurrencyTranslations = () => useTranslation("currencies", {
    i18n: ccI18n,
});
export default useCCTranslations;
