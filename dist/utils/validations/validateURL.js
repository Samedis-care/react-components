import ccI18n from "../../i18n";
/**
 * Validate URL
 * @param value The URL
 * @return valid?
 */
export const validateURLRaw = (value) => {
    if (!value)
        return false;
    try {
        new URL(value);
        return true;
    }
    catch {
        return false;
    }
};
/**
 * Validate URL
 */
const validateURL = (value, values, fieldDef) => {
    if (!validateURLRaw(value)) {
        return ccI18n.t("utils.validation.url", {
            attribute: fieldDef.getLabel(),
        });
    }
    return null;
};
export default validateURL;
