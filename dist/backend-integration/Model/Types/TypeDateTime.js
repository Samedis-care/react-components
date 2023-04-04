import i18n from "../../../i18n";
/**
 * Type for non-nullable dates with time
 */
var TypeDateTime = /** @class */ (function () {
    function TypeDateTime() {
        this.error = "";
        this.serialize = function (value) {
            return value.toISOString();
        };
        this.deserialize = function (value) {
            return new Date(value);
        };
    }
    TypeDateTime.prototype.validate = function () {
        return this.error || null;
    };
    TypeDateTime.prototype.getFilterType = function () {
        return "datetime";
    };
    TypeDateTime.prototype.getDefaultValue = function () {
        return new Date();
    };
    TypeDateTime.prototype.stringify = function (value) {
        return value.toLocaleString(i18n.language);
    };
    return TypeDateTime;
}());
export default TypeDateTime;
