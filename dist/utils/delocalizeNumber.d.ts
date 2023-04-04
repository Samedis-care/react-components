/**
 * Removes group separators from the given value and replaces the locale specific decimal separator with a dot for
 * usage with parseFloat(...). Returns an empty string if value is empty.
 * @param value The value to "delocalize"
 */
declare const delocalizeNumber: (value: string) => string;
export default delocalizeNumber;
