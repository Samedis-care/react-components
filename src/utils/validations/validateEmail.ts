import {
	ModelFieldDefinition,
	ModelFieldName,
	PageVisibility,
} from "../../backend-integration";
import ccI18n from "../../i18n";

const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/**
 * Validate email
 * @param value The email
 * @return valid?
 */
export const validateEmailRaw = (value: string): boolean =>
	emailRegex.test(value.toLowerCase());

/**
 * Validate email
 */
const validateEmail = <
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT
>(
	value: string,
	values: Record<string, unknown>,
	fieldDef: Pick<
		ModelFieldDefinition<string, KeyT, VisibilityT, CustomT>,
		"getLabel"
	>
): string | null => {
	if (!validateEmailRaw(value)) {
		return ccI18n.t("utils.validation.email", {
			attribute: fieldDef.getLabel(),
		});
	}
	return null;
};

export default validateEmail;
