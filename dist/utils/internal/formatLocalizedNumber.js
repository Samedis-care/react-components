/**
 * A well-formed currency code: three letters (ISO 4217), in any case. `Intl`
 * rejects every other text, and formats a well-formed code it doesn't know.
 */
const WELL_FORMED_CURRENCY = /^[a-z]{3}$/i;
/**
 * Whether `Intl` takes `currency` as a currency code: three letters (ISO 4217),
 * in any case. A well-formed code it doesn't know (`"XYZ"`) is formatted as
 * the code.
 * @param currency The currency; `null` or `undefined` from untyped data too
 */
export const isWellFormedCurrency = (currency) => currency != null && WELL_FORMED_CURRENCY.test(currency);
/**
 * ISO 4217's code for "no currency". It is formatted in place of a malformed
 * currency, and its text then takes the code's place.
 */
const STAND_IN_CURRENCY = "XXX";
/**
 * The fraction digits of `options`, two by default (as most currencies have),
 * within those `options` sets
 * @param options The options of `Intl.NumberFormat`
 */
const twoFractionDigits = (options) => {
    const { minimumFractionDigits: min, maximumFractionDigits: max } = options;
    return {
        minimumFractionDigits: min ?? Math.min(2, max ?? 2),
        maximumFractionDigits: max ?? Math.max(2, min ?? 2),
    };
};
/**
 * `options` without its currency (`currency`, `currencyDisplay`,
 * `currencySign`). A currency style becomes a decimal with two fraction
 * digits, within the fraction digits `options` sets.
 * @param options The options of `Intl.NumberFormat`
 */
const withoutCurrency = (options) => {
    const rest = { ...options };
    delete rest.currency;
    delete rest.currencyDisplay;
    delete rest.currencySign;
    if (options.style !== "currency")
        return rest;
    return { ...rest, style: "decimal", ...twoFractionDigits(options) };
};
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
export const getCurrencyFallback = (options) => {
    // `null` reaches here from untyped data
    const currency = options.currency;
    if (options.style === "currency" && currency) {
        return {
            options: {
                ...options,
                ...twoFractionDigits(options),
                currency: STAND_IN_CURRENCY,
                currencyDisplay: options.currencyDisplay === "name" ? "name" : "code",
            },
            currencyText: currency,
        };
    }
    return { options: withoutCurrency(options), currencyText: null };
};
/**
 * Formats `value` with a {@link CurrencyFallback}: its currency text in place
 * of the code
 * @param value The number
 * @param locale The locale (BCP 47 tag)
 * @param fallback The fallback
 */
const formatWithFallback = (value, locale, fallback) => {
    const { options, currencyText } = fallback;
    if (currencyText === null)
        return value.toLocaleString(locale, options);
    return new Intl.NumberFormat(locale, options)
        .formatToParts(value)
        .map((part) => (part.type === "currency" ? currencyText : part.value))
        .join("");
};
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
export const removeCurrencyText = (text, locale, fallback) => {
    const { options, currencyText } = fallback;
    if (!currencyText)
        return text;
    const types = new Intl.NumberFormat(locale, options)
        .formatToParts(1)
        .map((part) => part.type);
    const index = types.indexOf("currency") < types.indexOf("integer")
        ? text.indexOf(currencyText)
        : text.lastIndexOf(currencyText);
    if (index < 0)
        return text;
    return text.slice(0, index) + text.slice(index + currencyText.length);
};
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
const formatLocalizedNumber = (value, locale, options) => {
    try {
        return {
            text: value.toLocaleString(locale, options),
            currencyError: null,
        };
    }
    catch (error) {
        // `null` reaches here from untyped data: Intl reads it as the text "null"
        const currency = options?.currency;
        if (!options ||
            (options.style !== "currency" && currency === undefined) ||
            isWellFormedCurrency(currency))
            // not the currency
            throw error;
        let text;
        try {
            text = formatWithFallback(value, locale, getCurrencyFallback(options));
        }
        catch {
            // not (only) the currency: the options are invalid without it too
            throw error;
        }
        return {
            text,
            currencyError: error instanceof Error ? error : new Error(String(error)),
        };
    }
};
export default formatLocalizedNumber;
