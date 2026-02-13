/**
 * Type to handle an id array
 */
class TypeIds {
    validate() {
        return null;
    }
    getFilterType() {
        return "id";
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
export default TypeIds;
