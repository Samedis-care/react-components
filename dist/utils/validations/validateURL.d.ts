import { ModelFieldDefinition, ModelFieldName, PageVisibility } from "../../backend-integration";
/**
 * Validate URL
 * @param value The URL
 * @return valid?
 */
export declare const validateURLRaw: (value: string) => boolean;
/**
 * Validate URL
 */
declare const validateURL: <KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT>(value: string, values: Record<string, unknown>, fieldDef: Pick<ModelFieldDefinition<string, KeyT, VisibilityT, CustomT>, "getLabel">) => string | null;
export default validateURL;
