import ccI18n from "../../i18n";
import {
	ModelFieldDefinition,
	ModelFieldName,
	PageVisibility,
} from "../../backend-integration";

/**
 * Validate that the given value is truthy
 */
const validatePresence = <
	TypeT,
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT
>(
	value: TypeT,
	values: Record<KeyT, unknown>,
	fieldDef: Pick<
		ModelFieldDefinition<TypeT, KeyT, VisibilityT, CustomT>,
		"getLabel"
	>
): string | null => {
	if (!value) {
		return ccI18n.t("utils.validation.required", {
			attribute: fieldDef.getLabel(),
		});
	}
	return null;
};

export default validatePresence;
