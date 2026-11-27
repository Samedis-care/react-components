import React from "react";
import { TextFieldProps } from "@mui/material";
export type MultiLanguageInputSupportedLanguages = "aa" | "ab" | "ae" | "af" | "ak" | "am" | "an" | "ar" | "as" | "av" | "ay" | "az" | "ba" | "be" | "bg" | "bi" | "bm" | "bn" | "bo" | "br" | "bs" | "ca" | "ce" | "ch" | "co" | "cr" | "cs" | "cu" | "cv" | "cy" | "da" | "de" | "dv" | "dz" | "ee" | "el" | "en" | "eo" | "es" | "et" | "eu" | "fa" | "ff" | "fi" | "fj" | "fo" | "fr" | "fy" | "ga" | "gd" | "gl" | "gn" | "gu" | "gv" | "ha" | "he" | "hi" | "ho" | "hr" | "ht" | "hu" | "hy" | "hz" | "ia" | "id" | "ie" | "ig" | "ii" | "ik" | "io" | "is" | "it" | "iu" | "ja" | "jv" | "ka" | "kg" | "ki" | "kj" | "kk" | "kl" | "km" | "kn" | "ko" | "kr" | "ks" | "ku" | "kv" | "kw" | "ky" | "la" | "lb" | "lg" | "li" | "ln" | "lo" | "lt" | "lu" | "lv" | "mg" | "mh" | "mi" | "mk" | "ml" | "mn" | "mr" | "ms" | "mt" | "my" | "na" | "nb" | "nd" | "ne" | "ng" | "nl" | "nn" | "no" | "nr" | "nv" | "ny" | "oc" | "oj" | "om" | "or" | "os" | "pa" | "pi" | "pl" | "ps" | "pt" | "qu" | "rm" | "rn" | "ro" | "ru" | "rw" | "sa" | "sc" | "sd" | "se" | "sg" | "sh" | "si" | "sk" | "sl" | "sm" | "sn" | "so" | "sq" | "sr" | "ss" | "st" | "su" | "sv" | "sw" | "ta" | "te" | "tg" | "th" | "ti" | "tk" | "tl" | "tn" | "to" | "tr" | "ts" | "tt" | "tw" | "ty" | "ug" | "uk" | "ur" | "uz" | "ve" | "vi" | "vo" | "wa" | "wo" | "xh" | "yi" | "yo" | "za" | "zh" | "zu";
export type MultiLanguageInputProps = Omit<TextFieldProps, "value" | "onChange" | "onBlur" | "InputProps" | "label" | "name" | "required" | "fullWidth"> & {
    /**
     * The languages that can be edited: the default language first, then the
     * others in this order. The default language is `defaultLanguage` when it is
     * in this list; otherwise the components-care UI language when it is in this
     * list and `ignoreI18nLocale` is not set; otherwise the first entry. It is
     * the labelled and required field, and it follows later changes of these
     * props and of the UI language.
     *
     * In single-line mode the other languages' fields are shown below the
     * default one while the translate button is pressed. Until the user presses
     * it or types, they are also shown while the default language has no text
     * and another language has, so a text kept in another language is not
     * hidden. In multiline mode the textarea shows the default language until
     * another language's button below it is pressed, and again when that
     * language is no longer in this list.
     *
     * A language listed twice is shown once, at its first position. While the
     * list is empty, e.g. while an app loads its languages, the field shows
     * disabled with its label (and the asterisk of `required`), without a
     * language code, translate button or language buttons, until a language
     * arrives.
     */
    enabledLanguages: MultiLanguageInputSupportedLanguages[];
    /**
     * The language the record has to be filled in, e.g. the language its
     * backend keeps the main text in: the default language, whatever the UI
     * language. Its field is shown first, labelled and marked `required` for
     * every viewer. Ignored while it is `null` or `undefined` or not in
     * `enabledLanguages`; the default language is then the UI language or
     * `enabledLanguages[0]` (see `enabledLanguages`). Wins over
     * `ignoreI18nLocale`.
     * @default undefined
     */
    defaultLanguage?: MultiLanguageInputSupportedLanguages | null;
    /**
     * Make `enabledLanguages[0]` the default language instead of the UI
     * language. `defaultLanguage` wins over it.
     * @default false
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
     * In single-line mode the toggle is named and tooltipped after the label,
     * e.g. "Show translations of Title"; without a label it keeps the generic
     * name.
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
     * Marks the default language's field as required: an asterisk after the
     * label and the native `required` attribute (in multiline mode while the
     * default language is shown). Display only, like MUI's `required`: nothing
     * is validated. Pair it with a validator that checks the same language,
     * e.g. `validateLocalizedPresenceFor([language])` with `defaultLanguage`
     * set to that language; without `defaultLanguage` the required field is the
     * viewer's UI language, which differs from viewer to viewer.
     * @default false
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
