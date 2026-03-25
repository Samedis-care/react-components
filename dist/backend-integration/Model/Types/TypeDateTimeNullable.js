import ccI18n from "../../../i18n";
import getCurrentLocale from "../../../utils/getCurrentLocale";
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
            ? value.toLocaleString(getCurrentLocale(ccI18n))
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
