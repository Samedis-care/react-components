import { ModelFieldDefinition, ModelFieldName, PageVisibility } from "../../backend-integration";
declare const validateOptional: <TypeT, KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT>(callback: (value: TypeT, values: Record<string, unknown>, fieldDef: Pick<ModelFieldDefinition<TypeT, KeyT, VisibilityT, CustomT>, "getLabel">) => string | null) => (value: TypeT, values: Record<string, unknown>, fieldDef: Pick<ModelFieldDefinition<TypeT, KeyT, VisibilityT, CustomT>, "getLabel">) => string | null;
export default validateOptional;
