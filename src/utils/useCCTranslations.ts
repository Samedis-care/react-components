import { useTranslation, UseTranslationResponse } from "react-i18next";
import ccI18n from "../i18n";

/**
 * Internal helper for useTranslation hook
 */
const useCCTranslations = (): UseTranslationResponse<"translation"> =>
	useTranslation<"translation">(undefined, {
		i18n: ccI18n,
	});

export const useCCLanguagesTranslations = (): UseTranslationResponse<"languages"> =>
	useTranslation<"languages">("languages", {
		i18n: ccI18n,
	});

export const useCCLocaleSwitcherTranslations = (): UseTranslationResponse<"locale-switcher"> =>
	useTranslation<"locale-switcher">("locale-switcher", {
		i18n: ccI18n,
	});

export const useCCCountryTranslations = (): UseTranslationResponse<"countries"> =>
	useTranslation<"countries">("countries", {
		i18n: ccI18n,
	});

export const useCCCurrencyTranslations = (): UseTranslationResponse<"currencies"> =>
	useTranslation<"currencies">("currencies", {
		i18n: ccI18n,
	});

export default useCCTranslations;
