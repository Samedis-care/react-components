/**
 * Type to handle numbers
 * @type number if set, null if not set
 */
var TypeNumber = /** @class */ (function () {
    function TypeNumber() {
    }
    TypeNumber.prototype.validate = function () {
        return null;
    };
    TypeNumber.prototype.getFilterType = function () {
        return "number";
    };
    TypeNumber.prototype.getDefaultValue = function () {
        return null;
    };
    TypeNumber.prototype.stringify = function (value) {
        return value === null ? "" : value.toString();
    };
    return TypeNumber;
}());
export default TypeNumber;
