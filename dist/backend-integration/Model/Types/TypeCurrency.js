/**
 * Type to handle currencies
 * @type [string (ISO 4217 3 letter code), number] | null if not set
 */
var TypeCurrency = /** @class */ (function () {
    function TypeCurrency() {
    }
    TypeCurrency.prototype.validate = function () {
        return null;
    };
    TypeCurrency.prototype.getFilterType = function () {
        return "currency";
    };
    TypeCurrency.prototype.getDefaultValue = function () {
        return null;
    };
    TypeCurrency.prototype.stringify = function (value) {
        return value === null ? "" : "".concat(value[1].toString(), " ").concat(value[0]);
    };
    return TypeCurrency;
}());
export default TypeCurrency;
