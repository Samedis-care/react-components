import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";
import { MultiLanguageInputSupportedLanguages } from "../../../standalone/UIKit/InputControls/MultiLanguageInput";
/**
 * One language's text of a localized value
 */
export interface TypeLocalizedStringText {
    /**
     * The language the text is in
     */
    language: MultiLanguageInputSupportedLanguages;
    /**
     * The text, as stored
     */
    text: string;
}
/**
 * Type to handle localized strings: one text per language, keyed by language
 * code, e.g. `{ en: "Pump", de: "Pumpe" }`
 */
declare abstract class TypeLocalizedString implements Type<Partial<Record<MultiLanguageInputSupportedLanguages, string>>> {
    protected multiline: boolean;
    /**
     * The languages whose text shows, in this order, when the UI language has
     * none: the default language, then the other enabled languages; null for
     * every language the value holds, in the value's order
     */
    protected fallbackLanguages: MultiLanguageInputSupportedLanguages[] | null;
    /**
     * @param multiline Whether the text is edited in a textarea
     * @param enabledLanguages The field's languages: when the UI language has
     * no text, the first of them that has text shows. Null or omitted for every
     * language the value holds, in the value's order
     * @param defaultLanguage The language the record is filled in
     * (MultiLanguageInput's `defaultLanguage`): tried before the other enabled
     * languages. Ignored while null, omitted or not in `enabledLanguages`
     */
    constructor(multiline?: boolean, enabledLanguages?: MultiLanguageInputSupportedLanguages[] | null, defaultLanguage?: MultiLanguageInputSupportedLanguages | null);
    abstract render(params: ModelRenderParams<Partial<Record<MultiLanguageInputSupportedLanguages, string>>>): React.ReactElement;
    validate(): string | null;
    getFilterType(): FilterType;
    getDefaultValue(): Partial<Record<MultiLanguageInputSupportedLanguages, string>>;
    /**
     * The text of the first of the languages that has text; text of only
     * whitespace counts as none
     * @param value The value; null, undefined and a non-object have no text
     * @param languages The languages to look at, in order
     * @returns The language and its text, null if none of them has text
     */
    private static findText;
    /**
     * The text in the components-care UI language
     * @param value The value
     * @returns The UI language and its text, null if it has no text (or only
     * whitespace)
     */
    protected getUiLanguageText(value: Partial<Record<MultiLanguageInputSupportedLanguages, string>>): TypeLocalizedStringText | null;
    /**
     * The text shown when the UI language has none: the default language's when
     * it has text, otherwise the first other enabled language's that has text
     * (see the constructor)
     * @param value The value
     * @returns The language and its text, null if no fallback language has text
     */
    protected getFallbackText(value: Partial<Record<MultiLanguageInputSupportedLanguages, string>>): TypeLocalizedStringText | null;
    /**
     * The text in the UI language; when it has none (or only whitespace), the
     * default language's when it has text, otherwise the first other enabled
     * language's that has text (see the constructor)
     * @param value The value
     * @returns The text as stored, an empty string if no language has text
     */
    stringify(value: Partial<Record<MultiLanguageInputSupportedLanguages, string>>): string;
    deserialize: (value: unknown) => Partial<Record<MultiLanguageInputSupportedLanguages, string>>;
}
export default TypeLocalizedString;
