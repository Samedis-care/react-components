import ccI18n from "../../../i18n";
/**
 * Type for nullable dates
 */
class TypeDateTimeNullable {
    error = "";
    validate() {
        return this.error || null;
    }
    getFilterType() {
        return "datetime";
    }
    getDefaultValue() {
        return null;
    }
    stringify(value) {
        return value
            ? value.toLocaleString(ccI18n.language)
            : ccI18n.t("backend-integration.model.types.date-nullable.not-set");
    }
    serialize = (value) => {
        if (!value)
            return null;
        return value.toISOString();
    };
    deserialize = (value) => {
        if (value)
            return new Date(value);
        return null;
    };
}
export default TypeDateTimeNullable;
