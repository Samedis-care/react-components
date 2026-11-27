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
 * Whether `Intl` takes `currency` as a currency code: three letters (ISO 4217),
 * in any case. A well-formed code it doesn't know (`"XYZ"`) is formatted as
 * the code.
 * @param currency The currency; `null` or `undefined` from untyped data too
 */
export declare const isWellFormedCurrency: (currency: string | null | undefined) => boolean;
/**
 * What {@link formatLocalizedNumber} formats with in place of options whose
 * currency `Intl` rejects
 */
export interface CurrencyFallback {
    /**
     * Options of `Intl.NumberFormat` that `Intl` takes
     */
    options: Intl.NumberFormatOptions;
    /**
     * The text shown in place of the currency code that `options` format, or
     * `null` if they format no currency
     */
    currencyText: string | null;
}
/**
 * What {@link formatLocalizedNumber} formats with in place of `options` whose
 * currency `Intl` rejects:
 * - with `style: "currency"` and a currency text (`"EURO"`, `"€"`), the text
 *   as if it were a currency code `Intl` doesn't know: ISO 4217's "no
 *   currency" code, where the locale puts a code, with two fraction digits
 *   unless `options` sets them, and the text in its place. A code `Intl`
 *   doesn't know is shown as the code also where `currencyDisplay` asks for a
 *   symbol;
 * - otherwise `options` without the currency (see withoutCurrency).
 * @param options The options of `Intl.NumberFormat`
 */
export declare const getCurrencyFallback: (options: Intl.NumberFormatOptions) => CurrencyFallback;
/**
 * Removes the currency text of a {@link CurrencyFallback} from a text, so that
 * a number formatted with it, or typed in its place, can be read back: once,
 * where the locale puts the code (its first occurrence if the code comes
 * before the number, its last one otherwise). Digits or a "." in the currency
 * text then don't change the number: with the currency `"978"`, "978 1,978.00"
 * (en) is read as 1,978.00.
 * @param text The text
 * @param locale The locale (BCP 47 tag)
 * @param fallback The fallback
 * @returns The text without the currency text; `text` as it is if the fallback
 * has no currency text or the text doesn't contain it
 */
export declare const removeCurrencyText: (text: string, locale: string, fallback: CurrencyFallback) => string;
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
