/**
 * Removes group separators from the given value and replaces the decimal separator with a dot for
 * usage with parseFloat(...). The symbols the format writes around a number ("€" of a currency
 * format, "Cg." of XCG) are no part of it (see removeFormatSymbols). Returns an empty string if
 * value is empty, and "NaN" if it is no number:
 * - text without a digit that is not empty ("abc", ".", "-"); blanks and the format's own symbols,
 *   which is what is left when the user deletes the digits of a formatted number, count as empty
 * - a value whose . and , don't fit the locale's format (see fitsLocaleFormat), so that a typo
 *   such as "1.234.5" in de is not read as another number.
 *
 * The decimal separator is the locale's one, or a single . or , that can't be a group separator
 * (see getDecimalSeparator). A minus sign before the first digit ("-" or "−", also after a
 * currency symbol: "€ -5,00") becomes a leading "-".
 * @param value The value to "delocalize"
 * @param options The number formatting options used to format the number
 */
declare const delocalizeNumber: (value: string, options?: Intl.NumberFormatOptions) => string;
export default delocalizeNumber;
