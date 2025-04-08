import ccI18n from "../i18n";

/**
 * Gets the group separator from number by language
 * @param separatorType The separator type
 * @param options The number format options
 */
const getNumberSeparator = (
	separatorType: "decimal" | "group",
	options?: Intl.NumberFormatOptions,
): string => {
	const format = Intl.NumberFormat(ccI18n.language, options)
		.formatToParts(1000.11)
		.find((part) => part.type === separatorType);
	return format === undefined ? "," : format.value;
};
export default getNumberSeparator;
