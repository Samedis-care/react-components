import ccI18n from "../../../i18n";
/**
 * A type to handle signatures (for electronic signing)
 * @remarks The value is the signature as PNG data URI, empty if not signed
 */
class TypeSignature {
    validate() {
        return null;
    }
    getFilterType() {
        return null;
    }
    getDefaultValue() {
        return "";
    }
    stringify(value) {
        return value
            ? ccI18n.t("backend-integration.model.types.image.set")
            : ccI18n.t("backend-integration.model.types.image.not-set");
    }
}
export default TypeSignature;
