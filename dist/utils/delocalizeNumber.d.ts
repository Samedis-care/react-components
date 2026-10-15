/**
 * Removes group separators from the given value and replaces the decimal separator with a dot for
 * usage with parseFloat(...). Returns an empty string if value is empty.
 * The decimal separator is the locale's one, or a single . or , that can't be a group separator
 * (see getDecimalSeparator).
 * @param value The value to "delocalize"
 * @param options The number formatting options used to format the number
 */
declare const delocalizeNumber: (value: string, options?: Intl.NumberFormatOptions) => string;
export default delocalizeNumber;
