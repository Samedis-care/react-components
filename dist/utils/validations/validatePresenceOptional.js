import ccI18n from "../../i18n";
import validatePresence from "./validatePresence";
/**
 * Validate that the given value is truthy
 */
const validatePresenceOptional = (value, values, fieldDef) => {
    return validatePresence(value, values, fieldDef)
        ? ccI18n.t("utils.validation.missing", {
            attribute: fieldDef.getLabel(),
        })
        : null;
};
export default validatePresenceOptional;
