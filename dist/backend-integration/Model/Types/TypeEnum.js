var TypeEnum = /** @class */ (function () {
    function TypeEnum(values, numericMode) {
        if (numericMode === void 0) { numericMode = false; }
        var _this = this;
        // handle null/undefined values
        this.deserialize = function (value) {
            if (value === null || value === undefined)
                return "";
            if (typeof value === "number")
                return value.toString();
            if (typeof value === "string")
                return value;
            throw new Error("Unsupported data");
        };
        this.serialize = function (value) {
            return value === "" ? null : _this.numericMode ? parseInt(value) : value;
        };
        this.getEnumValues = function () { return _this.values; };
        this.values = values;
        this.numericMode = numericMode;
    }
    TypeEnum.prototype.validate = function (value) {
        if (value === "")
            return null;
        return this.values.find(function (entry) { return entry.value === value; })
            ? null
            : "Invalid Enum Value detected!"; // Developer warning
    };
    TypeEnum.prototype.getFilterType = function () {
        return "enum";
    };
    TypeEnum.prototype.getDefaultValue = function () {
        return "";
    };
    TypeEnum.prototype.stringify = function (value) {
        var _a;
        if (!value)
            return "";
        return (((_a = this.values.find(function (entry) { return entry.value === value; })) === null || _a === void 0 ? void 0 : _a.getLabel()) ||
            "Invalid Enum Value detected!");
    };
    return TypeEnum;
}());
export default TypeEnum;
