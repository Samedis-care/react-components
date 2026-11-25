import ccI18n from "../../i18n";
/**
 * Validate that the given value is present: a falsy value (`null`, `undefined`, `""`, `0`,
 * `false`), an empty array and an invalid date get the `utils.validation.required` message
 * with the field's label ("The Title field is required")
 * @remarks The validator of a required field: a `required` visibility only marks the field
 *          (see Visibility.required).
 */
const validatePresence = (value, values, fieldDef) => {
    if (!value ||
        (Array.isArray(value) && value.length === 0) ||
        (value instanceof Date && isNaN(value)) // invalid date
    ) {
        return ccI18n.t("utils.validation.required", {
            attribute: fieldDef.getLabel(),
        });
    }
    return null;
};
export default validatePresence;
