import {
	ModelFieldDefinition,
	ModelFieldName,
	PageVisibility,
} from "../../backend-integration";
import ccI18n from "../../i18n";

/**
 * Validate that the given array is not empty
 */
const validateArrayNotEmpty = <
	TypeT extends unknown[],
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT
>(
	value: TypeT,
	values: Record<string, unknown>,
	fieldDef: Pick<
		ModelFieldDefinition<TypeT, KeyT, VisibilityT, CustomT>,
		"getLabel"
	>
): string | null => {
	if (!value || value.length === 0) {
		return ccI18n.t("utils.validation.required", {
			attribute: fieldDef.getLabel(),
		});
	}
	return null;
};

export default validateArrayNotEmpty;
