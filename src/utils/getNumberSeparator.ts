import ccI18n from "../i18n";

/**
 * Gets the group seperator from number by language
 * @param seperatorType The seperator type (eg: group)
 */
const getNumberSeparator = (separatorType: string): string => {
	const format = Intl.NumberFormat(ccI18n.language)
		.formatToParts(1000.11)
		.find((part) => part.type === separatorType);
	return format === undefined ? "," : format.value;
};
export default getNumberSeparator;
