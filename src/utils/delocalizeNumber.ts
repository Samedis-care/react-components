import { getNumberSeparator } from "./index";

/**
 * Removes group separators from the given value and replaces the locale specific decimal separator with a dot for
 * usage with parseFloat(...). Returns an empty string if value is empty.
 * @param value The value to "delocalize"
 */
const delocalizeNumber = (value: string): string => {
	return value
		.replace(
			new RegExp("[^0-9\\" + getNumberSeparator("decimal") + "]", "g"),
			"",
		)
		.replace(new RegExp("\\" + getNumberSeparator("decimal"), "g"), ".");
};

export default delocalizeNumber;
