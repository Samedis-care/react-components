import getNumberSeparator from "./getNumberSeparator";
import isNegativeNumberText from "./internal/isNegativeNumberText";

/**
 * Finds the . or , the user meant as decimal separator in a value without the locale's decimal
 * separator. Touch keypads offer the decimal separator of the device's region, which isn't
 * necessarily the one of the current locale.
 *
 * - A single . or , is the decimal separator, unless it is the locale's group separator with
 *   1–3 digits that don't start with 0 before it and exactly 3 digits after it: "1.234" is 1234
 *   in de, es and it, "7.5" and "0.500" are 7.5 and 0.5.
 * - Of several, the last one with a digit after it is the decimal separator, and the others are
 *   group separators: "1.234.5" is 1234.5 in de. If exactly 3 digits follow it, all of them are
 *   group separators ("1.234.567"). One without a digit after it separates nothing: "7.5." is 7.5.
 * @param value The value, without the locale's decimal separator
 * @param options The number formatting options used to format the number
 * @returns The index of the decimal separator in value, or -1 if it has none
 */
const findDecimalSeparator = (
	value: string,
	options?: Intl.NumberFormatOptions,
): number => {
	// the digits right before and after each . or ,
	const marks = Array.from(value.matchAll(/(\d*)([.,])(?=(\d*))/g));
	const indexOf = (match: RegExpExecArray) => match.index + match[1].length;
	if (marks.length === 1) {
		const [match] = marks;
		const [, before, mark, after] = match;
		const isGroup =
			mark === getNumberSeparator("group", options) &&
			/^[1-9]\d{0,2}$/.test(before) &&
			after.length === 3;
		return isGroup ? -1 : indexOf(match);
	}
	const last = marks.findLast((match) => match[3] !== "");
	return last === undefined || last[3].length === 3 ? -1 : indexOf(last);
};

const digitsOf = (value: string) => value.replace(/[^0-9]/g, "");

/**
 * Removes group separators from the given value and replaces the decimal separator with a dot for
 * usage with parseFloat(...). Returns an empty string if value is empty.
 * The decimal separator is the locale's one or, in a value without it, a . or , typed on another
 * region's keypad (see findDecimalSeparator). A minus sign before the first digit ("-" or "−", also
 * after a currency symbol: "€ -5,00") becomes a leading "-"; without a digit there is no sign.
 * @param value The value to "delocalize"
 * @param options The number formatting options used to format the number
 */
const delocalizeNumber = (
	value: string,
	options?: Intl.NumberFormatOptions,
): string => {
	const decimal = getNumberSeparator("decimal", options);
	let unsigned: string;
	if (value.includes(decimal)) {
		unsigned = value
			.replace(new RegExp("[^0-9\\" + decimal + "]", "g"), "")
			.replace(new RegExp("\\" + decimal, "g"), ".");
	} else {
		const index = findDecimalSeparator(value, options);
		unsigned =
			index === -1
				? digitsOf(value)
				: digitsOf(value.slice(0, index)) +
					"." +
					digitsOf(value.slice(index + 1));
	}
	return isNegativeNumberText(value) && /[0-9]/.test(unsigned)
		? "-" + unsigned
		: unsigned;
};

export default delocalizeNumber;
