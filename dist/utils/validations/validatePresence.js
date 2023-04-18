import ccI18n from "../../i18n";
/**
 * Validate that the given value is truthy
 */
var validatePresence = function (value, values, fieldDef) {
    if (!value ||
        (value instanceof Date && isNaN(value)) // invalid date
    ) {
        return ccI18n.t("utils.validation.required", {
            attribute: fieldDef.getLabel(),
        });
    }
    return null;
};
export default validatePresence;
