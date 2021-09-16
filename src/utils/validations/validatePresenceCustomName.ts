import i18n from "i18next";

/**
 * validatePresence, but with a custom label (instead of the field label)
 * @param name The i18n key for getting the custom label
 */
const validatePresenceCustomName = <TypeT>(name: string) => (
	value: TypeT
): string | null => {
	if (!value) {
		return i18n.t("utils.validation.required", {
			attribute: i18n.t(name),
		});
	}
	return null;
};

export default validatePresenceCustomName;
