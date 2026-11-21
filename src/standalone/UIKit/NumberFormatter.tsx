import React, { useEffect, useMemo, useRef } from "react";
import useCurrentLocale from "../../utils/useCurrentLocale";
import formatLocalizedNumber from "../../utils/internal/formatLocalizedNumber";
import { captureError } from "../../framework/ErrorReporting";

/**
 * Props of {@link NumberFormatter}
 */
export interface NumberFormatterProps {
	/**
	 * The number to format. `null` and `undefined` render nothing, without a
	 * placeholder; `NaN` and `Infinity` are printed as "NaN" and "∞".
	 */
	value: number | null | undefined;
	/**
	 * Options of `Intl.NumberFormat` (`style`, `currency`,
	 * `minimumFractionDigits`, …); without them at most 3 fraction digits are
	 * shown. The locale cannot be set here.
	 *
	 * `currency` is an ISO 4217 code (`"EUR"`); a well-formed code `Intl` does
	 * not know (`"XYZ"`) is printed as it is. While it is missing with
	 * `style: "currency"`, or is not three letters (`""`, `"EURO"`), the number
	 * is shown without a currency, with two fraction digits unless
	 * `minimumFractionDigits` or `maximumFractionDigits` set others
	 * ("1,234.50"). The error is reported through `console.error` and the
	 * error reporter (source "NumberFormatter", see `configureErrorReporting`),
	 * once, not again on a re-render with the same currency. Options that are
	 * invalid for another reason throw while rendering, as `toLocaleString`
	 * does.
	 */
	options?: Intl.NumberFormatOptions;
}

/**
 * Renders a number as plain text, formatted with
 * `Number.prototype.toLocaleString` for the current language of the
 * components-care i18n instance (see `useCurrentLocale`); it re-renders when
 * that language changes. For a formatted number inside a string (a tooltip,
 * an `aria-label`), call `value.toLocaleString(useCurrentLocale(), options)`.
 */
const NumberFormatter = (props: NumberFormatterProps) => {
	const { value, options } = props;
	const locale = useCurrentLocale();
	const formatted = useMemo(
		() =>
			value != null ? formatLocalizedNumber(value, locale, options) : null,
		[value, locale, options],
	);
	const currencyError = formatted?.currencyError ?? null;

	// the error last reported, so that neither a re-render nor StrictMode's
	// second effect run reports it again
	const reportedRef = useRef<string | null>(null);
	const style = options?.style;
	const currency = options?.currency;
	useEffect(() => {
		if (!currencyError) return;
		const key = String(currencyError);
		if (reportedRef.current === key) return;
		reportedRef.current = key;
		captureError(currencyError, {
			source: "NumberFormatter",
			extra: { style, currency },
		});
		// eslint-disable-next-line no-console
		console.error(
			"[Components-Care] [NumberFormatter] Invalid currency, the number is shown without it:",
			currencyError,
		);
	}, [currencyError, style, currency]);

	return <>{formatted ? formatted.text : ""}</>;
};

export default React.memo(NumberFormatter);
