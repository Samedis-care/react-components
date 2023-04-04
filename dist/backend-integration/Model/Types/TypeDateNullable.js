import ccI18n from "../../../i18n";
import i18n from "../../../i18n";
/**
 * Type for nullable dates
 */
var TypeDateNullable = /** @class */ (function () {
    function TypeDateNullable() {
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
    TypeDateNullable.prototype.validate = function () {
        return this.error || null;
    };
    TypeDateNullable.prototype.getFilterType = function () {
        return "date";
    };
    TypeDateNullable.prototype.getDefaultValue = function () {
        return null;
    };
    TypeDateNullable.prototype.stringify = function (value) {
        return value
            ? value.toLocaleDateString(i18n.language)
            : ccI18n.t("backend-integration.model.types.date-nullable.not-set");
    };
    return TypeDateNullable;
}());
export default TypeDateNullable;
