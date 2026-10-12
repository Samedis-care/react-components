/**
 * Type for enums: the value is one of the values. An enum that can be empty declares `""` as a
 * value (`TypeEnum<X | "">`), nothing adds it implicitly.
 */
class TypeEnum {
    values;
    defaultValue;
    numericMode;
    /**
     * @param values The values
     * @param defaultValue The value of a new record: one of the values, or `""` for an enum that
     * declares it, which then starts empty
     * @param numericMode Send the values to the server as numbers
     */
    constructor(values, defaultValue, numericMode = false) {
        this.values = values;
        this.defaultValue = defaultValue;
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
    // an arrow: model code calls it detached
    getDefaultValue = () => this.defaultValue;
    stringify(value) {
        if (!value)
            return "";
        return (this.values.find((entry) => entry.value === value)?.getLabel() ||
            "Invalid Enum Value detected!");
    }
    // the server's value is one of the values; no value (null) is the default value, which is
    // `""` for an enum that declares it
    deserialize = (value) => {
        if (value === null || value === undefined)
            return this.defaultValue;
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
