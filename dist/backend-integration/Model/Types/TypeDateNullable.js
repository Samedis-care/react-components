import ccI18n from "../../../i18n";
import getCurrentLocale from "../../../utils/getCurrentLocale";
import { formatDateOnly, toDateOnly } from "../../../utils/dateOnlyUtils";
/**
 * Type for nullable dates
 */
class TypeDateNullable {
    error = "";
    validate() {
        return this.error || null;
    }
    getFilterType() {
        return "date";
    }
    getDefaultValue() {
        return null;
    }
    stringify(value) {
        return value
            ? formatDateOnly(value, getCurrentLocale(ccI18n))
            : ccI18n.t("backend-integration.model.types.date-nullable.not-set");
    }
    serialize = (value) => {
        if (!value)
            return null;
        return value.toISOString();
    };
    deserialize = (value) => {
        if (value)
            return toDateOnly(value);
        return null;
    };
}
export default TypeDateNullable;
