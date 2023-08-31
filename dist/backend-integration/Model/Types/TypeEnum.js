class TypeEnum {
    values;
    numericMode;
    constructor(values, numericMode = false) {
        this.values = values;
        this.numericMode = numericMode;
    }
    validate(value) {
        if (value === "")
            return null;
        return this.values.find((entry) => entry.value === value)
            ? null
            : "Invalid Enum Value detected!"; // Developer warning
    }
    getFilterType() {
        return "enum";
    }
    getDefaultValue() {
        return "";
    }
    stringify(value) {
        if (!value)
            return "";
        return (this.values.find((entry) => entry.value === value)?.getLabel() ||
            "Invalid Enum Value detected!");
    }
    // handle null/undefined values
    deserialize = (value) => {
        if (value === null || value === undefined)
            return "";
        if (typeof value === "number")
            return value.toString();
        if (typeof value === "string")
            return value;
        throw new Error("Unsupported data");
    };
    serialize = (value) => value === "" ? null : this.numericMode ? parseInt(value) : value;
    getEnumValues = () => this.values;
}
export default TypeEnum;
