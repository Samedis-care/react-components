/**
 * A well-formed currency code: three letters (ISO 4217), in any case. `Intl`
 * rejects every other text, and formats a well-formed code it doesn't know.
 */
const WELL_FORMED_CURRENCY = /^[a-z]{3}$/i;
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
 * Formats `value` with `currency` as if it were a currency code `Intl` doesn't
 * know: where the locale puts a code, with two fraction digits unless
 * `options` sets them. A code `Intl` doesn't know is shown as the code also
 * where `currencyDisplay` asks for a symbol.
 * @param value The number
 * @param locale The locale (BCP 47 tag)
 * @param options The options of `Intl.NumberFormat` (`style: "currency"`)
 * @param currency The text to show as the currency
 */
const formatWithCurrencyText = (value, locale, options, currency) => new Intl.NumberFormat(locale, {
    ...options,
    ...twoFractionDigits(options),
    currency: STAND_IN_CURRENCY,
    currencyDisplay: options.currencyDisplay === "name" ? "name" : "code",
})
    .formatToParts(value)
    .map((part) => (part.type === "currency" ? currency : part.value))
    .join("");
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
            (currency != null && WELL_FORMED_CURRENCY.test(currency)))
            // not the currency
            throw error;
        let text;
        try {
            text =
                options.style === "currency" && currency
                    ? formatWithCurrencyText(value, locale, options, currency)
                    : value.toLocaleString(locale, withoutCurrency(options));
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
