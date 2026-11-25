import { ModelFieldDefinition, ModelFieldName, PageVisibility } from "../../backend-integration";
/**
 * Validate that the given value is present: a falsy value (`null`, `undefined`, `""`, `0`,
 * `false`), an empty array and an invalid date get the `utils.validation.required` message
 * with the field's label ("The Title field is required")
 * @remarks The validator of a required field: a `required` visibility only marks the field
 *          (see Visibility.required).
 */
declare const validatePresence: <TypeT, KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT>(value: TypeT, values: Record<string, unknown>, fieldDef: Pick<ModelFieldDefinition<TypeT, KeyT, VisibilityT, CustomT>, "getLabel">) => Promise<string | null> | string | null;
export default validatePresence;
