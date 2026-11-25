import ccI18n from "../../../i18n";
/**
 * A type to handle images
 * @remarks The value is the image's URL (or data URI), empty for no image, or an image the
 *          user picked as Blob (a File). The Blob is sent as it is: RailsApiClient uploads it
 *          as a file.
 */
class TypeImage {
    params;
    /**
     * The fields a `placeholder` function reads re-render the field
     */
    settings;
    constructor(params) {
        this.params = params;
        if (params?.placeholderValues?.length)
            this.settings = { updateHooks: params.placeholderValues };
    }
    /**
     * The placeholder for the record with `values`
     * @param values The record's values (`RenderParams.values`)
     * @returns The placeholder's URL or data URI, or `undefined` for none
     */
    getPlaceholder(values) {
        const placeholder = this.params?.placeholder;
        return typeof placeholder === "function"
            ? placeholder(values)
            : placeholder;
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
