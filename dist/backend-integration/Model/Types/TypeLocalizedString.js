import ccI18n from "../../../i18n";
import { getCurrentLanguage } from "../../../utils/getCurrentLocale";
/**
 * Type to handle localized strings: one text per language, keyed by language
 * code, e.g. `{ en: "Pump", de: "Pumpe" }`
 */
class TypeLocalizedString {
    multiline;
    /**
     * The languages whose text shows, in this order, when the UI language has
     * none: the default language, then the other enabled languages; null for
     * every language the value holds, in the value's order
     */
    fallbackLanguages;
    /**
     * @param multiline Whether the text is edited in a textarea
     * @param enabledLanguages The field's languages: when the UI language has
     * no text, the first of them that has text shows. Null or omitted for every
     * language the value holds, in the value's order
     * @param defaultLanguage The language the record is filled in
     * (MultiLanguageInput's `defaultLanguage`): tried before the other enabled
     * languages. Ignored while null, omitted or not in `enabledLanguages`
     */
    constructor(multiline = false, enabledLanguages = null, defaultLanguage = null) {
        this.multiline = multiline;
        this.fallbackLanguages =
            enabledLanguages &&
                defaultLanguage &&
                enabledLanguages.includes(defaultLanguage)
                ? [
                    defaultLanguage,
                    ...enabledLanguages.filter((lang) => lang !== defaultLanguage),
                ]
                : enabledLanguages;
    }
    validate() {
        return null;
    }
    getFilterType() {
        return "localized-string";
    }
    getDefaultValue() {
        return {};
    }
    /**
     * The text of the first of the languages that has text; text of only
     * whitespace counts as none
     * @param value The value; null, undefined and a non-object have no text
     * @param languages The languages to look at, in order
     * @returns The language and its text, null if none of them has text
     */
    static findText(value, languages) {
        if (!value || typeof value !== "object")
            return null;
        for (const language of languages) {
            const text = value[language];
            if (typeof text === "string" && text.trim())
                return {
                    language: language,
                    text,
                };
        }
        return null;
    }
    /**
     * The text in the components-care UI language
     * @param value The value
     * @returns The UI language and its text, null if it has no text (or only
     * whitespace)
     */
    getUiLanguageText(value) {
        return TypeLocalizedString.findText(value, [getCurrentLanguage(ccI18n)]);
    }
    /**
     * The text shown when the UI language has none: the default language's when
     * it has text, otherwise the first other enabled language's that has text
     * (see the constructor)
     * @param value The value
     * @returns The language and its text, null if no fallback language has text
     */
    getFallbackText(value) {
        return TypeLocalizedString.findText(value, this.fallbackLanguages ??
            (value && typeof value === "object" ? Object.keys(value) : []));
    }
    /**
     * The text in the UI language; when it has none (or only whitespace), the
     * default language's when it has text, otherwise the first other enabled
     * language's that has text (see the constructor)
     * @param value The value
     * @returns The text as stored, an empty string if no language has text
     */
    stringify(value) {
        return ((this.getUiLanguageText(value) ?? this.getFallbackText(value))?.text ?? "");
    }
    deserialize = (value) => {
        if (value == null)
            return {};
        return value;
    };
}
export default TypeLocalizedString;
