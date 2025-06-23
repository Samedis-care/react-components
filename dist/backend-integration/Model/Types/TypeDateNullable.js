import ccI18n from "../../../i18n";
import { normalizeDate } from "./Utils/DateUtils";
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
            ? value.toLocaleDateString(ccI18n.language)
            : ccI18n.t("backend-integration.model.types.date-nullable.not-set");
    }
    serialize = (value) => {
        if (!value)
            return null;
        return value.toISOString();
    };
    deserialize = (value) => {
        if (value)
            return normalizeDate(new Date(value));
        return null;
    };
}
export default TypeDateNullable;
