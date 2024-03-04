import delocalizeNumber from "./delocalizeNumber";
/**
 * Parses a localized number string
 * @param value The number string
 */
const parseLocalizedNumber = (value) => {
    const num = delocalizeNumber(value);
    return num !== "" ? parseFloat(num) : null;
};
export default parseLocalizedNumber;
