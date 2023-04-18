/**
 * Type to handle string arrays (e.g. id arrays)
 */
var TypeStringArray = /** @class */ (function () {
    function TypeStringArray() {
        this.deserialize = function (value) {
            if (value == null)
                return [];
            if (!Array.isArray(value))
                throw new Error("data type mismatch");
            return value;
        };
    }
    TypeStringArray.prototype.validate = function () {
        return null;
    };
    TypeStringArray.prototype.getFilterType = function () {
        return null;
    };
    TypeStringArray.prototype.getDefaultValue = function () {
        return [];
    };
    TypeStringArray.prototype.stringify = function (value) {
        return value.join(",");
    };
    return TypeStringArray;
}());
export default TypeStringArray;
