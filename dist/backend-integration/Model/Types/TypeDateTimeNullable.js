import ccI18n from "../../../i18n";
import i18n from "../../../i18n";
/**
 * Type for nullable dates
 */
var TypeDateTimeNullable = /** @class */ (function () {
    function TypeDateTimeNullable() {
        this.error = "";
        this.serialize = function (value) {
            if (!value)
                return null;
            return value.toISOString();
        };
        this.deserialize = function (value) {
            if (value)
                return new Date(value);
            return null;
        };
    }
    TypeDateTimeNullable.prototype.validate = function () {
        return this.error || null;
    };
    TypeDateTimeNullable.prototype.getFilterType = function () {
        return "datetime";
    };
    TypeDateTimeNullable.prototype.getDefaultValue = function () {
        return null;
    };
    TypeDateTimeNullable.prototype.stringify = function (value) {
        return value
            ? value.toLocaleString(i18n.language)
            : ccI18n.t("backend-integration.model.types.date-nullable.not-set");
    };
    return TypeDateTimeNullable;
}());
export default TypeDateTimeNullable;
