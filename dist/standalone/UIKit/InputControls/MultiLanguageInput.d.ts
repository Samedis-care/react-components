import React from "react";
import { TextFieldProps } from "@mui/material";
export type MultiLanguageInputSupportedLanguages = "aa" | "ab" | "ae" | "af" | "ak" | "am" | "an" | "ar" | "as" | "av" | "ay" | "az" | "ba" | "be" | "bg" | "bi" | "bm" | "bn" | "bo" | "br" | "bs" | "ca" | "ce" | "ch" | "co" | "cr" | "cs" | "cu" | "cv" | "cy" | "da" | "de" | "dv" | "dz" | "ee" | "el" | "en" | "eo" | "es" | "et" | "eu" | "fa" | "ff" | "fi" | "fj" | "fo" | "fr" | "fy" | "ga" | "gd" | "gl" | "gn" | "gu" | "gv" | "ha" | "he" | "hi" | "ho" | "hr" | "ht" | "hu" | "hy" | "hz" | "ia" | "id" | "ie" | "ig" | "ii" | "ik" | "io" | "is" | "it" | "iu" | "ja" | "jv" | "ka" | "kg" | "ki" | "kj" | "kk" | "kl" | "km" | "kn" | "ko" | "kr" | "ks" | "ku" | "kv" | "kw" | "ky" | "la" | "lb" | "lg" | "li" | "ln" | "lo" | "lt" | "lu" | "lv" | "mg" | "mh" | "mi" | "mk" | "ml" | "mn" | "mr" | "ms" | "mt" | "my" | "na" | "nb" | "nd" | "ne" | "ng" | "nl" | "nn" | "no" | "nr" | "nv" | "ny" | "oc" | "oj" | "om" | "or" | "os" | "pa" | "pi" | "pl" | "ps" | "pt" | "qu" | "rm" | "rn" | "ro" | "ru" | "rw" | "sa" | "sc" | "sd" | "se" | "sg" | "sh" | "si" | "sk" | "sl" | "sm" | "sn" | "so" | "sq" | "sr" | "ss" | "st" | "su" | "sv" | "sw" | "ta" | "te" | "tg" | "th" | "ti" | "tk" | "tl" | "tn" | "to" | "tr" | "ts" | "tt" | "tw" | "ty" | "ug" | "uk" | "ur" | "uz" | "ve" | "vi" | "vo" | "wa" | "wo" | "xh" | "yi" | "yo" | "za" | "zh" | "zu";
export type MultiLanguageInputProps = Omit<TextFieldProps, "value" | "onChange" | "onBlur" | "InputProps" | "label" | "name" | "required" | "fullWidth"> & {
    /**
     * The languages that can be edited: the default language first, then the
     * others in this order. The default language is the components-care UI
     * language when it is in this list and `ignoreI18nLocale` is not set,
     * otherwise the first entry; it is the labelled and required field, and it
     * follows later changes of this list and of the UI language. In multiline
     * mode the textarea shows the default language until another language's
     * button below it is pressed, and again when that language is no longer in
     * this list.
     */
    enabledLanguages: MultiLanguageInputSupportedLanguages[];
    /**
     * Ignore i18n locale settings when determining default language
     */
    ignoreI18nLocale?: boolean;
    /**
     * The text per language, keyed by language code, e.g.
     * `{ en: "Pump", de: "Pumpe" }`. Use `{}` for no text; must not be `null`
     * or `undefined`. A language without a key (or with `null`) shows an empty
     * field. Keys of languages that are not in `enabledLanguages` are kept by
     * `onChange`.
     */
    values: Partial<Record<MultiLanguageInputSupportedLanguages, string>>;
    /**
     * Change event
     * @param newValues New values
     */
    onChange: (newValues: Partial<Record<MultiLanguageInputSupportedLanguages, string>>) => void;
    /**
     * Label of the default language's field (single-line) or of the textarea
     * (multiline), and the name of the group around all language fields. Each
     * field is named with the label and its language, e.g. "Title (German)":
     * the labelled field reads the language with its label (visually hidden),
     * the other languages' fields, which show only their code, carry the name as
     * `aria-label`. Without a label each field is named with its language only.
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
    /**
     * Does the value differ from the server-side value?
     * @remarks Presentational only; set by the form engine from `RenderParams.dirty`.
     */
    dirty?: boolean;
};
/**
 * The `ownerState` of the `languageLabel` theme slot (a language button below
 * a multiline field).
 */
export interface MultiLanguageInputLanguageLabelOwnerState {
    /** The button's language is the one the textarea edits (pressed) */
    active: boolean;
}
/**
 * Theme slots of `CcMultiLanguageInput`:
 * - `languageSwitcher`: the group of language buttons below a multiline field
 *   (a `ToggleButtonGroup`);
 * - `languageLabel`: one language button of that group (a `ToggleButton`,
 *   gets {@link MultiLanguageInputLanguageLabelOwnerState});
 * - `languageLabelInputAdornment`: the code adornment of a single-line field.
 */
export type MultiLanguageInputClassKey = "languageSwitcher" | "languageLabel" | "languageLabelInputAdornment";
declare const _default: React.MemoExoticComponent<(inProps: MultiLanguageInputProps) => React.JSX.Element>;
export default _default;
