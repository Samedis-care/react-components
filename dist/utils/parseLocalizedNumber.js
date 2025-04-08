import delocalizeNumber from "./delocalizeNumber";
/**
 * Parses a localized number string
 * @param value The number string
 * @param options The number formatting options used to format the number
 */
const parseLocalizedNumber = (value, options) => {
    const num = delocalizeNumber(value, options);
    return num !== "" ? parseFloat(num) : null;
};
export default parseLocalizedNumber;
