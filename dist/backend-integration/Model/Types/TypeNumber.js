/**
 * Type to handle numbers
 * @type number if set, null if not set
 */
class TypeNumber {
    validate() {
        return null;
    }
    getFilterType() {
        return "number";
    }
    getDefaultValue() {
        return null;
    }
    stringify(value) {
        return value === null ? "" : value.toString();
    }
}
export default TypeNumber;
