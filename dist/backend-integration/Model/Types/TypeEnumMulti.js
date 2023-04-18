/**
 * Enum type with multi-select capability
 */
var TypeMultiEnum = /** @class */ (function () {
    function TypeMultiEnum(values) {
        var _this = this;
        this.getEnumValues = function () { return _this.values; };
        this.deserialize = function (value) { var _a; return (_a = value) !== null && _a !== void 0 ? _a : []; };
        this.values = values;
    }
    TypeMultiEnum.prototype.validate = function (values) {
        var _this = this;
        if (values.length === 0)
            return null;
        return values.find(function (value) {
            return _this.values.find(function (entry) { return entry.value === value; });
        })
            ? null
            : "Invalid Enum Value detected!"; // Developer warning
    };
    TypeMultiEnum.prototype.getFilterType = function () {
        return "enum";
    };
    TypeMultiEnum.prototype.getDefaultValue = function () {
        return [];
    };
    TypeMultiEnum.prototype.stringify = function (values) {
        var _this = this;
        return values
            .map(function (value) {
            var _a;
            return ((_a = _this.values.find(function (val) { return val.value === value; })) === null || _a === void 0 ? void 0 : _a.getLabel()) ||
                "Invalid Enum Value detected!";
        })
            .join(", ");
    };
    return TypeMultiEnum;
}());
export default TypeMultiEnum;
