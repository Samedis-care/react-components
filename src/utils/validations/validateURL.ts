import {
	ModelFieldDefinition,
	ModelFieldName,
	PageVisibility,
} from "../../backend-integration";
import ccI18n from "../../i18n";

/**
 * Validate URL
 * @param value The URL
 * @return valid?
 */
export const validateURLRaw = (value: string): boolean => {
	if (!value) return false;
	try {
		new URL(value);
		return true;
	} catch {
		return false;
	}
};

/**
 * Validate URL
 */
const validateURL = <
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
>(
	value: string,
	values: Record<string, unknown>,
	fieldDef: Pick<
		ModelFieldDefinition<string, KeyT, VisibilityT, CustomT>,
		"getLabel"
	>,
): string | null => {
	if (!validateURLRaw(value)) {
		return ccI18n.t("utils.validation.url", {
			attribute: fieldDef.getLabel(),
		});
	}
	return null;
};

export default validateURL;
