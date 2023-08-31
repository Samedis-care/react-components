/**
 * Enum type with multi-select capability
 */
class TypeMultiEnum {
    values;
    constructor(values) {
        this.values = values;
    }
    validate(values) {
        if (values.length === 0)
            return null;
        return values.find((value) => this.values.find((entry) => entry.value === value))
            ? null
            : "Invalid Enum Value detected!"; // Developer warning
    }
    getFilterType() {
        return "enum";
    }
    getDefaultValue() {
        return [];
    }
    stringify(values) {
        return values
            .map((value) => this.values.find((val) => val.value === value)?.getLabel() ||
            "Invalid Enum Value detected!")
            .join(", ");
    }
    getEnumValues = () => this.values;
    deserialize = (value) => value ?? [];
}
export default TypeMultiEnum;
