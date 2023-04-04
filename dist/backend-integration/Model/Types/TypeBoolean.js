import ccI18n from "../../../i18n";
/**
 * Type for booleans
 */
var TypeBoolean = /** @class */ (function () {
    function TypeBoolean() {
    }
    TypeBoolean.prototype.validate = function () {
        return null;
    };
    TypeBoolean.prototype.getFilterType = function () {
        return "boolean";
    };
    TypeBoolean.prototype.getDefaultValue = function () {
        return false;
    };
    TypeBoolean.prototype.stringify = function (value) {
        return value
            ? ccI18n.t("backend-integration.model.types.boolean.true")
            : ccI18n.t("backend-integration.model.types.boolean.false");
    };
    return TypeBoolean;
}());
export default TypeBoolean;
