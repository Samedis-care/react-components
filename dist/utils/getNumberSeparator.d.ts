/**
 * Gets the group separator from number by language
 * @param separatorType The separator type
 */
declare const getNumberSeparator: (separatorType: "decimal" | "group") => string;
export default getNumberSeparator;
