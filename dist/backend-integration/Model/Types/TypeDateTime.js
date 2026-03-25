import ccI18n from "../../../i18n";
import getCurrentLocale from "../../../utils/getCurrentLocale";
/**
 * Type for non-nullable dates with time
 */
class TypeDateTime {
    error = "";
    validate() {
        return this.error || null;
    }
    getFilterType() {
        return "datetime";
    }
    getDefaultValue() {
        return new Date();
    }
    stringify(value) {
        return value.toLocaleString(getCurrentLocale(ccI18n));
    }
    serialize = (value) => {
        return value.toISOString();
    };
    deserialize = (value) => {
        return new Date(value);
    };
}
export default TypeDateTime;
