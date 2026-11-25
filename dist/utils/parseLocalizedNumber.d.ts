/**
 * Parses a localized number string (see delocalizeNumber). A minus sign before the first digit
 * makes the number negative; "-0" is 0.
 * @param value The number string
 * @param options The number formatting options used to format the number
 * @returns The number; null for an empty text: blank, or only the symbols of the format ("€" for
 * a currency); NaN for a text that is no number: without a digit ("abc", ".", "-"), or with . and
 * , that don't fit the locale's format ("1.234.5" in de)
 */
declare const parseLocalizedNumber: (value: string, options?: Intl.NumberFormatOptions) => number | null;
export default parseLocalizedNumber;
