import ccI18n from "../../../i18n";
import { getCurrentLanguage } from "../../../utils/getCurrentLocale";
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
        const currentLang = getCurrentLanguage(ccI18n);
        return value[currentLang] ?? "";
    }
    deserialize = (value) => {
        if (value == null)
            return {};
        return value;
    };
}
export default TypeLocalizedString;
