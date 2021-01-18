import ccI18n from "../i18n";

/**
 * Gets the group separator from number by language
 * @param separatorType The separator type
 */
const getNumberSeparator = (separatorType: "decimal" | "group"): string => {
	const format = Intl.NumberFormat(ccI18n.language)
		.formatToParts(1000.11)
		.find((part) => part.type === separatorType);
	return format === undefined ? "," : format.value;
};
export default getNumberSeparator;
