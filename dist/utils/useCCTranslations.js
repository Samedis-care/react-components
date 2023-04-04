import { useTranslation } from "react-i18next";
import ccI18n from "../i18n";
/**
 * Internal helper for useTranslation hook
 */
var useCCTranslations = function () {
    return useTranslation("translation", {
        i18n: ccI18n,
    });
};
export var useCCLanguagesTranslations = function () {
    return useTranslation("languages", {
        i18n: ccI18n,
    });
};
export var useCCLocaleSwitcherTranslations = function () {
    return useTranslation("locale-switcher", {
        i18n: ccI18n,
    });
};
export var useCCCountryTranslations = function () {
    return useTranslation("countries", {
        i18n: ccI18n,
    });
};
export var useCCCurrencyTranslations = function () {
    return useTranslation("currencies", {
        i18n: ccI18n,
    });
};
export default useCCTranslations;
