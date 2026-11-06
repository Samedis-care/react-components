/**
 * Parses a localized number string (see delocalizeNumber). A minus sign before the first digit
 * makes the number negative; "-0" is 0.
 * @param value The number string
 * @param options The number formatting options used to format the number
 * @returns The number, null for a text without a digit or separator, NaN for a separator
 * without a digit (".")
 */
declare const parseLocalizedNumber: (value: string, options?: Intl.NumberFormatOptions) => number | null;
export default parseLocalizedNumber;
