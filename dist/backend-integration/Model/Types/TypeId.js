/**
 * Type to handle an id
 */
class TypeId {
    validate() {
        return null;
    }
    getFilterType() {
        return "string";
    }
    getDefaultValue() {
        return null;
    }
    stringify(value) {
        return value ?? "null";
    }
}
export default TypeId;
