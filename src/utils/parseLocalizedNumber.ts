import { delocalizeNumber } from "./index";

/**
 * Parses a localized number string
 * @param value The number string
 */
const parseLocalizedNumber = (value: string): number | null => {
	const num = delocalizeNumber(value);
	return num !== "" ? parseFloat(num) : null;
};

export default parseLocalizedNumber;
