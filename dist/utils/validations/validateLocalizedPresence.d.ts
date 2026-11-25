import { ModelFieldDefinition, ModelFieldName, PageVisibility } from "../../backend-integration";
import { MultiLanguageInputSupportedLanguages } from "../../standalone/UIKit/InputControls/MultiLanguageInput";
/**
 * A localized string field's value: its text per language
 */
export type LocalizedPresenceValue = Partial<Record<MultiLanguageInputSupportedLanguages, string>> | null | undefined;
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
declare const validateLocalizedPresence: <TypeT extends LocalizedPresenceValue, KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT>(value: TypeT, _values: Record<string, unknown>, fieldDef: Pick<ModelFieldDefinition<TypeT, KeyT, VisibilityT, CustomT>, "getLabel">) => string | null;
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
export declare const validateLocalizedPresenceFor: (languages: readonly MultiLanguageInputSupportedLanguages[]) => <TypeT extends LocalizedPresenceValue, KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT>(value: TypeT, _values: Record<string, unknown>, fieldDef: Pick<ModelFieldDefinition<TypeT, KeyT, VisibilityT, CustomT>, "getLabel">) => string | null;
export default validateLocalizedPresence;
