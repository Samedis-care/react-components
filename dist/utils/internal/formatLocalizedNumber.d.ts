/**
 * The result of {@link formatLocalizedNumber}
 */
export interface LocalizedNumber {
    /**
     * The formatted number
     */
    text: string;
    /**
     * Why `text` does not use the currency of the options as given: the error
     * formatting with them threw. `null` if `text` uses the options as given.
     */
    currencyError: Error | null;
}
/**
 * Formats a number like `value.toLocaleString(locale, options)`, except that a
 * currency `Intl` rejects does not throw:
 * - with `style: "currency"` and a `currency` that is not three letters
 *   (`"EURO"`, `"€"`), that text is shown where the locale puts a code
 *   ("EURO 1,234.50" in en, "1.234,50 EURO" in de), with two fraction digits
 *   unless `options` sets them;
 * - with `style: "currency"` and no `currency` (`undefined`, `null` or `""`),
 *   the number is formatted without one, with two fraction digits unless
 *   `options` sets them ("1,234.50");
 * - with another style, the currency is left out (it isn't shown there).
 *
 * A well-formed code `Intl` doesn't know (`"XYZ"`) is formatted as it is.
 * Options that are invalid for another reason throw, as with `toLocaleString`.
 * @param value The number
 * @param locale The locale (BCP 47 tag)
 * @param options The options of `Intl.NumberFormat`
 * @returns The text, and the error if the currency was not used as given
 */
declare const formatLocalizedNumber: (value: number, locale: string, options?: Intl.NumberFormatOptions) => LocalizedNumber;
export default formatLocalizedNumber;
