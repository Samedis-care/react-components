import { ModelFieldDefinition, ModelFieldName, PageVisibility } from "../../backend-integration";
/**
 * Validate that the given value is truthy
 */
declare const validatePresence: <TypeT, KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT>(value: TypeT, values: Record<string, unknown>, fieldDef: Pick<ModelFieldDefinition<TypeT, KeyT, VisibilityT, CustomT>, "getLabel">) => Promise<string | null> | string | null;
export default validatePresence;
