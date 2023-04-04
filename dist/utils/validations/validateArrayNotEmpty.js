import ccI18n from "../../i18n";
/**
 * Validate that the given array is not empty
 */
var validateArrayNotEmpty = function (value, values, fieldDef) {
    if (!value || value.length === 0) {
        return ccI18n.t("utils.validation.required", {
            attribute: fieldDef.getLabel(),
        });
    }
    return null;
};
export default validateArrayNotEmpty;
