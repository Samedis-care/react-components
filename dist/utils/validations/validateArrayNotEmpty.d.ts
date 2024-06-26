import { ModelFieldDefinition, ModelFieldName, PageVisibility } from "../../backend-integration";
/**
 * Validate that the given array is not empty
 */
declare const validateArrayNotEmpty: <TypeT extends unknown[], KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT>(value: TypeT, values: Record<string, unknown>, fieldDef: Pick<ModelFieldDefinition<TypeT, KeyT, VisibilityT, CustomT>, "getLabel">) => string | null;
export default validateArrayNotEmpty;
