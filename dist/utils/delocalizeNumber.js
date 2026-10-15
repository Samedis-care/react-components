import getNumberSeparator from "./getNumberSeparator";
/**
 * Gets the separator the user meant as decimal separator in the given value.
 *
 * Touch keypads offer the decimal separator of the device's region, which isn't necessarily the
 * one of the current locale. So without the locale's decimal separator, a single . or , is read as
 * the decimal separator, unless the locale formats numbers with it as group separator in that
 * position (e.g. "1.234" for de).
 * @param value The value
 * @param options The number formatting options used to format the number
 */
const getDecimalSeparator = (value, options) => {
    const decimal = getNumberSeparator("decimal", options);
    if (value.includes(decimal))
        return decimal;
    const marks = value.match(/[.,]/g);
    if (marks?.length !== 1)
        return decimal;
    const [, before, mark, after] = /(\d*)([.,])(\d*)/.exec(value);
    const isGroup = mark === getNumberSeparator("group", options) &&
        /^[1-9]\d{0,2}$/.test(before) &&
        after.length === 3;
    return isGroup ? decimal : mark;
};
/**
 * Removes group separators from the given value and replaces the decimal separator with a dot for
 * usage with parseFloat(...). Returns an empty string if value is empty.
 * The decimal separator is the locale's one, or a single . or , that can't be a group separator
 * (see getDecimalSeparator).
 * @param value The value to "delocalize"
 * @param options The number formatting options used to format the number
 */
const delocalizeNumber = (value, options) => {
    const decimal = getDecimalSeparator(value, options);
    return value
        .replace(new RegExp("[^0-9\\" + decimal + "]", "g"), "")
        .replace(new RegExp("\\" + decimal, "g"), ".");
};
export default delocalizeNumber;
