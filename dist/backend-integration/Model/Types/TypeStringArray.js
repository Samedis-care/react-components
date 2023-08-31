/**
 * Type to handle string arrays (e.g. id arrays)
 */
class TypeStringArray {
    validate() {
        return null;
    }
    getFilterType() {
        return null;
    }
    getDefaultValue() {
        return [];
    }
    stringify(value) {
        return value.join(",");
    }
    deserialize = (value) => {
        if (value == null)
            return [];
        if (!Array.isArray(value))
            throw new Error("data type mismatch");
        return value;
    };
}
export default TypeStringArray;
