import {
	ModelFieldDefinition,
	ModelFieldName,
	PageVisibility,
} from "../../backend-integration";
import { MultiLanguageInputSupportedLanguages } from "../../standalone/UIKit/InputControls/MultiLanguageInput";

const validateLocalized =
	<KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT>(
		callback: (
			value: string,
			values: Record<string, unknown>,
			fieldDef: Pick<
				ModelFieldDefinition<string, KeyT, VisibilityT, CustomT>,
				"getLabel"
			>,
		) => string | null,
	) =>
	(
		value: Record<MultiLanguageInputSupportedLanguages, string>,
		values: Record<string, unknown>,
		fieldDef: Pick<
			ModelFieldDefinition<string, KeyT, VisibilityT, CustomT>,
			"getLabel"
		>,
	): string | null => {
		if (!value) return null;
		const validationMsgs = Object.keys(value)
			.map((language) => {
				const result = callback(
					value[language as keyof typeof value],
					values,
					fieldDef,
				);
				if (result) return language + ": " + result;
				return null;
			})
			.filter((result) => !!result);
		if (validationMsgs.length === 0) return null;
		return validationMsgs.join("\n");
	};

export default validateLocalized;
