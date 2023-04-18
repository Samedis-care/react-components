import ccI18n from "../../i18n";
var emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
/**
 * Validate email
 * @param value The email
 * @return valid?
 */
export var validateEmailRaw = function (value) {
    return !!value && emailRegex.test(value.toLowerCase());
};
/**
 * Validate email
 */
var validateEmail = function (value, values, fieldDef) {
    if (!validateEmailRaw(value)) {
        return ccI18n.t("utils.validation.email", {
            attribute: fieldDef.getLabel(),
        });
    }
    return null;
};
export default validateEmail;
