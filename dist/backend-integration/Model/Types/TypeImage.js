import ccI18n from "../../../i18n";
/**
 * A type to handle images
 */
var TypeImage = /** @class */ (function () {
    function TypeImage(params) {
        this.params = params;
    }
    TypeImage.prototype.getParams = function () {
        var _a;
        return (_a = this.params) !== null && _a !== void 0 ? _a : {};
    };
    TypeImage.prototype.validate = function () {
        return null;
    };
    TypeImage.prototype.getFilterType = function () {
        return null;
    };
    TypeImage.prototype.getDefaultValue = function () {
        return "";
    };
    TypeImage.prototype.stringify = function (value) {
        return value
            ? ccI18n.t("backend-integration.model.types.image.set")
            : ccI18n.t("backend-integration.model.types.image.not-set");
    };
    return TypeImage;
}());
export default TypeImage;
