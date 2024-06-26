import { UseTranslationResponse } from "react-i18next";
import { FlatNamespace } from "i18next";
/**
 * Internal helper for useTranslation hook
 */
declare const useCCTranslations: () => UseTranslationResponse<"translation", undefined>;
export declare const useCCTranslationsNS: <N extends FlatNamespace | FlatNamespace[]>(namespaces: N) => UseTranslationResponse<N, undefined>;
export declare const useCCLanguagesTranslations: () => UseTranslationResponse<"languages", undefined>;
export declare const useCCLocaleSwitcherTranslations: () => UseTranslationResponse<"locale-switcher", undefined>;
export declare const useCCCountryTranslations: () => UseTranslationResponse<"countries", undefined>;
export declare const useCCCurrencyTranslations: () => UseTranslationResponse<"currencies", undefined>;
export default useCCTranslations;
