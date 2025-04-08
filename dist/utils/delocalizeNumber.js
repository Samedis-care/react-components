import getNumberSeparator from "./getNumberSeparator";
/**
 * Removes group separators from the given value and replaces the locale specific decimal separator with a dot for
 * usage with parseFloat(...). Returns an empty string if value is empty.
 * @param value The value to "delocalize"
 * @param options The number formatting options used to format the number
 */
const delocalizeNumber = (value, options) => {
    return value
        .replace(new RegExp("[^0-9\\" + getNumberSeparator("decimal", options) + "]", "g"), "")
        .replace(new RegExp("\\" + getNumberSeparator("decimal", options), "g"), ".");
};
export default delocalizeNumber;
