import { useTranslation, UseTranslationResponse } from "react-i18next";
import ccI18n from "../i18n";

/**
 * Internal helper for useTranslation hook
 */
const useCCTranslations = (): UseTranslationResponse<"translation"> =>
	useTranslation<"translation">(undefined, {
		i18n: ccI18n,
	});

export default useCCTranslations;
