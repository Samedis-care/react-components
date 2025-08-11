import ccI18n from "../../i18n";
import {
	ModelFieldDefinition,
	ModelFieldName,
	PageVisibility,
} from "../../backend-integration";
import validatePresence from "./validatePresence";

/**
 * Validate that the given value is truthy
 */
const validatePresenceOptional = <
	TypeT,
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
>(
	value: TypeT,
	values: Record<string, unknown>,
	fieldDef: Pick<
		ModelFieldDefinition<TypeT, KeyT, VisibilityT, CustomT>,
		"getLabel"
	>,
): Promise<string | null> | string | null => {
	return validatePresence(value, values, fieldDef)
		? ccI18n.t("utils.validation.missing", {
				attribute: fieldDef.getLabel(),
			})
		: null;
};

export default validatePresenceOptional;
