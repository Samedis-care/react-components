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
declare const parseLocalizedNumber: (value: string, options?: Intl.NumberFormatOptions) => number | null;
export default parseLocalizedNumber;
