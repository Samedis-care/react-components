import ccI18n from "../../../i18n";
/**
 * A type to handle images
 */
class TypeImage {
    params;
    constructor(params) {
        this.params = params;
    }
    getParams() {
        return this.params ?? {};
    }
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
export default TypeImage;
