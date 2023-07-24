import { Namespace, UseTranslationResponse } from "react-i18next";
/**
 * Internal helper for useTranslation hook
 */
declare const useCCTranslations: () => UseTranslationResponse<"translation">;
export declare const useCCTranslationsNS: <N extends Namespace<string>>(namespaces: N) => UseTranslationResponse<N, undefined>;
export declare const useCCLanguagesTranslations: () => UseTranslationResponse<"languages">;
export declare const useCCLocaleSwitcherTranslations: () => UseTranslationResponse<"locale-switcher">;
export declare const useCCCountryTranslations: () => UseTranslationResponse<"countries">;
export declare const useCCCurrencyTranslations: () => UseTranslationResponse<"currencies">;
export default useCCTranslations;
