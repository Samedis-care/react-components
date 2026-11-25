import ccI18n from "../../i18n";
/**
 * Whether a language's entry holds text, not only whitespace
 * @param text The language's entry
 * @returns true for a string with a non-whitespace character
 */
const hasText = (text) => typeof text === "string" && text.trim() !== "";
/**
 * The `utils.validation.required` message with the field's label ("The Title field is
 * required"), as `validatePresence` gives it
 * @param fieldDef The field, for its label
 * @returns The message
 */
const requiredMessage = (fieldDef) => ccI18n.t("utils.validation.required", { attribute: fieldDef.getLabel() });
/**
 * Validate that a localized string field has a text in at least one language: `null`, an
 * empty object, and languages holding only empty or whitespace text get the
 * `utils.validation.required` message with the field's label ("The Title field is required").
 * `validatePresence` counts every object as present, and `validateLocalized` only checks the
 * languages that hold text, so neither refuses a localized field without any.
 * @remarks The validator of a required localized field: a `required` visibility only marks
 *          the field (see Visibility.required). To require given languages, e.g. the app's
 *          default language, use `validateLocalizedPresenceFor`.
 * @example
 * title: {
 * 	type: new ModelDataTypeLocalizedStringRenderer({ … }),
 * 	visibility: { … edit: ModelVisibilityEditRequired … },
 * 	getLabel: () => "Title",
 * 	validate: validateLocalizedPresence,
 * 	customData: null,
 * }
 */
const validateLocalizedPresence = (value, _values, fieldDef) => value && Object.values(value).some(hasText)
    ? null
    : requiredMessage(fieldDef);
/**
 * A validator that requires a text in each of `languages`, e.g. the language the app falls
 * back to. Each language without text (missing, empty or only whitespace) gets a line
 * "<language>: The <label> field is required", in the order of `languages`, as
 * `validateLocalized` lists its languages.
 * @param languages The languages that must hold text
 * @returns The validator for the field's `validate`
 * @example
 * validate: validateLocalizedPresenceFor(["en"]), // "en: The Title field is required"
 */
export const validateLocalizedPresenceFor = (languages) => (value, _values, fieldDef) => {
    const missing = languages.filter((language) => !hasText(value?.[language]));
    if (missing.length === 0)
        return null;
    const message = requiredMessage(fieldDef);
    return missing.map((language) => language + ": " + message).join("\n");
};
export default validateLocalizedPresence;
