import { delocalizeNumber } from "./index";
/**
 * Parses a localized number string
 * @param value The number string
 */
var parseLocalizedNumber = function (value) {
    var num = delocalizeNumber(value);
    return num !== "" ? parseFloat(num) : null;
};
export default parseLocalizedNumber;
