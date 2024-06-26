import { ModelFieldDefinition, ModelFieldName, PageVisibility } from "../../backend-integration";
import { MultiLanguageInputSupportedLanguages } from "../../standalone/UIKit/InputControls/MultiLanguageInput";
declare const validateLocalized: <KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT>(callback: (value: string, values: Record<string, unknown>, fieldDef: Pick<ModelFieldDefinition<string, KeyT, VisibilityT, CustomT>, "getLabel">) => string | null) => (value: Record<MultiLanguageInputSupportedLanguages, string>, values: Record<string, unknown>, fieldDef: Pick<ModelFieldDefinition<string, KeyT, VisibilityT, CustomT>, "getLabel">) => string | null;
export default validateLocalized;
