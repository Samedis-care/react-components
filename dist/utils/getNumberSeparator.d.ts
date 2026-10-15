/**
 * Gets the decimal or group separator of the current locale
 * @param separatorType The separator type
 * @param options The number format options
 */
declare const getNumberSeparator: (separatorType: "decimal" | "group", options?: Intl.NumberFormatOptions) => string;
export default getNumberSeparator;
