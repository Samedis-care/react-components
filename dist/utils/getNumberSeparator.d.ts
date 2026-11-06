/**
 * Gets the decimal or group separator of the current locale (the language of the CC i18n
 * instance), as numbers formatted with the given options show it. Options and locales that
 * leave a separator out of some numbers don't change it: the group separator of es is "."
 * although es shows 1234 as "1234", and also with `useGrouping: false`.
 * @param separatorType The separator type
 * @param options The number format options
 * @returns The separator, or "," if numbers in this format have none
 */
declare const getNumberSeparator: (separatorType: "decimal" | "group", options?: Intl.NumberFormatOptions) => string;
export default getNumberSeparator;
