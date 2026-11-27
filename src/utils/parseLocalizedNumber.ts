import delocalizeNumber from "./delocalizeNumber";

/**
 * Parses a localized number string (see delocalizeNumber), such as
 * `num.toLocaleString(locale, options)` or what the user typed in its place. A minus sign before
 * the first digit makes the number negative; "-0" is 0.
 * @param value The number string
 * @param options The number formatting options used to format the number. With
 * `style: "percent"` the text is a percentage: "75%" and "75" are 0.75. The text of a
 * `notation` other than `"standard"` ("1.2K", "1.2E3") and of `currencySign: "accounting"`
 * ("($5.00)") is not read back as its number.
 * @returns The number; null for an empty text: blank, or only the symbols of the format ("€" for
 * a currency, "%" for a percentage); NaN for a text that is no number: without a digit ("abc",
 * ".", "-"), or with . and , that don't fit the locale's format ("1.234.5" in de)
 */
const parseLocalizedNumber = (
	value: string,
	options?: Intl.NumberFormatOptions,
): number | null => {
	const num = delocalizeNumber(value, options);
	if (num === "") return null;
	// the exponent moves the decimal point of a percentage in the text: 1.1% is 0.011, where a
	// division by 100 gives 0.011000000000000001
	const parsed = parseFloat(options?.style === "percent" ? num + "e-2" : num);
	// -0 would be shown as "-0" and stored as 0
	return parsed === 0 ? 0 : parsed;
};

export default parseLocalizedNumber;
