import { useTranslation, UseTranslationResponse } from "react-i18next";
import ccI18n from "../i18n";
import { FlatNamespace } from "i18next";

/**
 * Internal helper for useTranslation hook
 */
const useCCTranslations = (): UseTranslationResponse<
	"translation",
	undefined
> =>
	useTranslation<"translation">("translation", {
		i18n: ccI18n,
	});

export const useCCTranslationsNS = <N extends FlatNamespace | FlatNamespace[]>(
	namespaces: N,
): UseTranslationResponse<N, undefined> =>
	useTranslation<N>(namespaces, {
		i18n: ccI18n,
	});

export const useCCLanguagesTranslations = (): UseTranslationResponse<
	"languages",
	undefined
> =>
	useTranslation<"languages">("languages", {
		i18n: ccI18n,
	});

export const useCCLocaleSwitcherTranslations = (): UseTranslationResponse<
	"locale-switcher",
	undefined
> =>
	useTranslation<"locale-switcher">("locale-switcher", {
		i18n: ccI18n,
	});

export const useCCCountryTranslations = (): UseTranslationResponse<
	"countries",
	undefined
> =>
	useTranslation<"countries">("countries", {
		i18n: ccI18n,
	});

export const useCCCurrencyTranslations = (): UseTranslationResponse<
	"currencies",
	undefined
> =>
	useTranslation<"currencies">("currencies", {
		i18n: ccI18n,
	});

export default useCCTranslations;
