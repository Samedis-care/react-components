/**
 * Type to handle strings
 */
class TypeString {
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
        return "";
    }
    stringify(value) {
        return value;
    }
}
export default TypeString;
