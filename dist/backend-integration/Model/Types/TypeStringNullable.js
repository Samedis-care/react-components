/**
 * Type for strings that can be unset (null), e.g. backend fields without a default
 */
class TypeStringNullable {
    multiline;
    constructor(multiline = false) {
        this.multiline = multiline;
    }
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
        return value ?? "";
    }
}
export default TypeStringNullable;
