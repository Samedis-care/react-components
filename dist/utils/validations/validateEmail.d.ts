import { ModelFieldDefinition, PageVisibility } from "../../backend-integration";
/**
 * Validate email
 * @param value The email
 * @return valid?
 */
export declare const validateEmailRaw: (value: string) => boolean;
/**
 * Validate email
 */
declare const validateEmail: <KeyT extends string, VisibilityT extends PageVisibility, CustomT>(value: string, values: Record<string, unknown>, fieldDef: Pick<ModelFieldDefinition<string, KeyT, VisibilityT, CustomT>, "getLabel">) => string | null;
export default validateEmail;
