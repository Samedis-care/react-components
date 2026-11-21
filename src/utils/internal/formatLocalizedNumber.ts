/**
 * The result of {@link formatLocalizedNumber}
 */
export interface LocalizedNumber {
	/**
	 * The formatted number
	 */
	text: string;
	/**
	 * Why the currency was left out of `text`: the error formatting with the
	 * given options threw. `null` if `text` uses the options as given.
	 */
	currencyError: Error | null;
}

/**
 * `options` without its currency (`currency`, `currencyDisplay`,
 * `currencySign`). A currency style becomes a decimal with the two fraction
 * digits most currencies have, within the fraction digits `options` sets.
 * @param options The options of `Intl.NumberFormat`
 */
const withoutCurrency = (
	options: Intl.NumberFormatOptions,
): Intl.NumberFormatOptions => {
	const rest = { ...options };
	delete rest.currency;
	delete rest.currencyDisplay;
	delete rest.currencySign;
	if (options.style !== "currency") return rest;
	const { minimumFractionDigits: min, maximumFractionDigits: max } = options;
	return {
		...rest,
		style: "decimal",
		minimumFractionDigits: min ?? Math.min(2, max ?? 2),
		maximumFractionDigits: max ?? Math.max(2, min ?? 2),
	};
};

/**
 * Formats a number like `value.toLocaleString(locale, options)`, except that a
 * currency `Intl` rejects does not throw: with `style: "currency"` and no
 * `currency`, or a `currency` that is not three letters (`""`, `"EURO"`), the
 * number is formatted without the currency, with two fraction digits unless
 * `options` sets them ("1,234.50"). A well-formed code `Intl` doesn't know
 * (`"XYZ"`) is formatted as it is. Options that are invalid for another
 * reason throw, as with `toLocaleString`.
 * @param value The number
 * @param locale The locale (BCP 47 tag)
 * @param options The options of `Intl.NumberFormat`
 * @returns The text, and the error if the currency was left out
 */
const formatLocalizedNumber = (
	value: number,
	locale: string,
	options?: Intl.NumberFormatOptions,
): LocalizedNumber => {
	try {
		return {
			text: value.toLocaleString(locale, options),
			currencyError: null,
		};
	} catch (error) {
		if (
			!options ||
			(options.style !== "currency" && options.currency === undefined)
		)
			throw error;
		let text: string;
		try {
			text = value.toLocaleString(locale, withoutCurrency(options));
		} catch {
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
