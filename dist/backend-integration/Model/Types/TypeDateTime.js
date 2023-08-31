import i18n from "../../../i18n";
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
        return value.toLocaleString(i18n.language);
    }
    serialize = (value) => {
        return value.toISOString();
    };
    deserialize = (value) => {
        return new Date(value);
    };
}
export default TypeDateTime;
