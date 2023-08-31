import ccI18n from "../../../i18n";
/**
 * Type for booleans
 */
class TypeBoolean {
    validate() {
        return null;
    }
    getFilterType() {
        return "boolean";
    }
    getDefaultValue() {
        return false;
    }
    stringify(value) {
        return value
            ? ccI18n.t("backend-integration.model.types.boolean.true")
            : ccI18n.t("backend-integration.model.types.boolean.false");
    }
}
export default TypeBoolean;
