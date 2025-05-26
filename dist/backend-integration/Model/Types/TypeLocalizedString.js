import ccI18n from "../../../i18n";
/**
 * Type to handle localized strings
 */
class TypeLocalizedString {
    multiline;
    constructor(multiline = false) {
        this.multiline = multiline;
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
    stringify(value) {
        if (!value)
            return "";
        const currentLang = ccI18n.language.split("-")[0];
        return value[currentLang] ?? "";
    }
    deserialize = (value) => {
        if (value == null)
            return {};
        return value;
    };
}
export default TypeLocalizedString;
