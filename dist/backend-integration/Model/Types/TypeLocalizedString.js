import ccI18n from "../../../i18n";
/**
 * Type to handle localized strings
 */
var TypeLocalizedString = /** @class */ (function () {
    function TypeLocalizedString(multiline) {
        if (multiline === void 0) { multiline = false; }
        this.multiline = multiline;
    }
    TypeLocalizedString.prototype.validate = function () {
        return null;
    };
    TypeLocalizedString.prototype.getFilterType = function () {
        return "localized-string";
    };
    TypeLocalizedString.prototype.getDefaultValue = function () {
        return {};
    };
    TypeLocalizedString.prototype.stringify = function (value) {
        var _a;
        if (!value)
            return "";
        var currentLang = ccI18n.language.split("-")[0];
        return (_a = value[currentLang]) !== null && _a !== void 0 ? _a : "";
    };
    return TypeLocalizedString;
}());
export default TypeLocalizedString;
