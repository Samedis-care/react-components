/**
 * Type to handle currencies
 * @type [string (ISO 4217 3 letter code), number] | null if not set
 */
class TypeCurrency {
    validate() {
        return null;
    }
    getFilterType() {
        return "currency";
    }
    getDefaultValue() {
        return null;
    }
    stringify(value) {
        return value === null ? "" : `${value[1].toString()} ${value[0]}`;
    }
}
export default TypeCurrency;
