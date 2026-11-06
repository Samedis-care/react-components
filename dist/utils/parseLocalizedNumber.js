import delocalizeNumber from "./delocalizeNumber";
/**
 * Parses a localized number string (see delocalizeNumber). A minus sign before the first digit
 * makes the number negative; "-0" is 0.
 * @param value The number string
 * @param options The number formatting options used to format the number
 * @returns The number, null for a text without a digit or separator, NaN for a separator
 * without a digit (".")
 */
const parseLocalizedNumber = (value, options) => {
    const num = delocalizeNumber(value, options);
    if (num === "")
        return null;
    const parsed = parseFloat(num);
    // -0 would be shown as "-0" and stored as 0
    return parsed === 0 ? 0 : parsed;
};
export default parseLocalizedNumber;
