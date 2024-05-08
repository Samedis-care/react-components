import React from "react";
import { TextFieldProps } from "@mui/material";
export type MultiLanguageInputSupportedLanguages = "aa" | "ab" | "ae" | "af" | "ak" | "am" | "an" | "ar" | "as" | "av" | "ay" | "az" | "ba" | "be" | "bg" | "bi" | "bm" | "bn" | "bo" | "br" | "bs" | "ca" | "ce" | "ch" | "co" | "cr" | "cs" | "cu" | "cv" | "cy" | "da" | "de" | "dv" | "dz" | "ee" | "el" | "en" | "eo" | "es" | "et" | "eu" | "fa" | "ff" | "fi" | "fj" | "fo" | "fr" | "fy" | "ga" | "gd" | "gl" | "gn" | "gu" | "gv" | "ha" | "he" | "hi" | "ho" | "hr" | "ht" | "hu" | "hy" | "hz" | "ia" | "id" | "ie" | "ig" | "ii" | "ik" | "io" | "is" | "it" | "iu" | "ja" | "jv" | "ka" | "kg" | "ki" | "kj" | "kk" | "kl" | "km" | "kn" | "ko" | "kr" | "ks" | "ku" | "kv" | "kw" | "ky" | "la" | "lb" | "lg" | "li" | "ln" | "lo" | "lt" | "lu" | "lv" | "mg" | "mh" | "mi" | "mk" | "ml" | "mn" | "mr" | "ms" | "mt" | "my" | "na" | "nb" | "nd" | "ne" | "ng" | "nl" | "nn" | "no" | "nr" | "nv" | "ny" | "oc" | "oj" | "om" | "or" | "os" | "pa" | "pi" | "pl" | "ps" | "pt" | "qu" | "rm" | "rn" | "ro" | "ru" | "rw" | "sa" | "sc" | "sd" | "se" | "sg" | "sh" | "si" | "sk" | "sl" | "sm" | "sn" | "so" | "sq" | "sr" | "ss" | "st" | "su" | "sv" | "sw" | "ta" | "te" | "tg" | "th" | "ti" | "tk" | "tl" | "tn" | "to" | "tr" | "ts" | "tt" | "tw" | "ty" | "ug" | "uk" | "ur" | "uz" | "ve" | "vi" | "vo" | "wa" | "wo" | "xh" | "yi" | "yo" | "za" | "zh" | "zu";
export type MultiLanguageInputProps = Omit<TextFieldProps, "value" | "onChange" | "onBlur" | "InputProps" | "label" | "name" | "required" | "fullWidth"> & {
    /**
     * The languages shown
     * First entry is fallback default language
     */
    enabledLanguages: MultiLanguageInputSupportedLanguages[];
    /**
     * Ignore i18n locale settings when determining default language
     */
    ignoreI18nLocale?: boolean;
    /**
     * The current values
     */
    values: Partial<Record<MultiLanguageInputSupportedLanguages, string>>;
    /**
     * Change event
     * @param newValues New values
     */
    onChange: (newValues: Partial<Record<MultiLanguageInputSupportedLanguages, string>>) => void;
    /**
     * Label for the text field
     */
    label?: string;
    /**
     * Disable red translate icon if translation is incomplete
     */
    disableIncompleteMarker?: boolean;
    /**
     * Name of the control (used for form engine)
     */
    name?: string;
    /**
     * Is the default language required
     */
    required?: boolean;
    /**
     * Blur event handler
     */
    onBlur?: React.FocusEventHandler;
    /**
     * Display error
     */
    error?: boolean;
    /**
     * Display warning
     */
    warning?: boolean;
};
export interface MultiLanguageInputLanguageLabelOwnerState {
    active: boolean;
}
export type MultiLanguageInputClassKey = "languageLabel" | "languageLabelInputAdornment";
declare const _default: React.MemoExoticComponent<(inProps: MultiLanguageInputProps) => React.JSX.Element>;
export default _default;
