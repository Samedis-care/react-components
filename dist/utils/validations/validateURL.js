import ccI18n from "../../i18n";
/**
 * Validate URL
 * @param value The URL
 * @return valid?
 */
export var validateURLRaw = function (value) {
    if (!value)
        return false;
    try {
        new URL(value);
        return true;
    }
    catch (_a) {
        return false;
    }
};
/**
 * Validate URL
 */
var validateURL = function (value, values, fieldDef) {
    if (!validateURLRaw(value)) {
        return ccI18n.t("utils.validation.url", {
            attribute: fieldDef.getLabel(),
        });
    }
    return null;
};
export default validateURL;
