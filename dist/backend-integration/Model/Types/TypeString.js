/**
 * Type to handle strings
 */
var TypeString = /** @class */ (function () {
    function TypeString(multiline) {
        if (multiline === void 0) { multiline = false; }
        this.multiline = multiline;
    }
    TypeString.prototype.validate = function () {
        return null;
    };
    TypeString.prototype.getFilterType = function () {
        return "string";
    };
    TypeString.prototype.getDefaultValue = function () {
        return "";
    };
    TypeString.prototype.stringify = function (value) {
        return value;
    };
    return TypeString;
}());
export default TypeString;
