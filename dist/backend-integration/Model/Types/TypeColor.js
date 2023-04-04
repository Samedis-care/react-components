/**
 * Type to handle (hex string) colors
 */
var TypeColor = /** @class */ (function () {
    function TypeColor() {
    }
    TypeColor.prototype.validate = function () {
        return null;
    };
    TypeColor.prototype.getFilterType = function () {
        return null;
    };
    TypeColor.prototype.getDefaultValue = function () {
        return "";
    };
    TypeColor.prototype.stringify = function (value) {
        return value;
    };
    return TypeColor;
}());
export default TypeColor;
