/**
 * Type to handle an id
 */
var TypeId = /** @class */ (function () {
    function TypeId() {
    }
    TypeId.prototype.validate = function () {
        return null;
    };
    TypeId.prototype.getFilterType = function () {
        return "string";
    };
    TypeId.prototype.getDefaultValue = function () {
        return null;
    };
    TypeId.prototype.stringify = function (value) {
        return value !== null && value !== void 0 ? value : "null";
    };
    return TypeId;
}());
export default TypeId;
