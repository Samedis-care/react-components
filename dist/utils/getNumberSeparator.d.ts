/**
 * Gets the group separator from number by language
 * @param separatorType The separator type
 * @param options The number format options
 */
declare const getNumberSeparator: (separatorType: "decimal" | "group", options?: Intl.NumberFormatOptions) => string;
export default getNumberSeparator;
