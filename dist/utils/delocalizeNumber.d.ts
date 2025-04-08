/**
 * Removes group separators from the given value and replaces the locale specific decimal separator with a dot for
 * usage with parseFloat(...). Returns an empty string if value is empty.
 * @param value The value to "delocalize"
 * @param options The number formatting options used to format the number
 */
declare const delocalizeNumber: (value: string, options?: Intl.NumberFormatOptions) => string;
export default delocalizeNumber;
