import { useEffect, useRef } from "react";
import { captureError } from "../../framework/ErrorReporting";

/**
 * Reports a currency that `Intl` rejects, which a component formatted its
 * number without (see `formatLocalizedNumber`): once to the error reporter
 * (`captureError` with `source` and the extra `{ style, currency }`; Sentry
 * unless the app calls `configureErrorReporting`) and through `console.error`.
 * Not again for the same error, neither on a re-render nor on StrictMode's
 * second effect run.
 * @param source The component that reports it: the report's source and the
 * console message's prefix
 * @param currencyError The error that formatting with the currency threw, or
 * `null` if nothing is to be reported
 * @param disabled Report nothing (the component's `disableErrorReporting`)
 * @param style The `style` of the number format options
 * @param currency The currency of the number format options
 */
const useCurrencyErrorReport = (
	source: string,
	currencyError: Error | null,
	disabled: boolean | undefined,
	style: string | undefined,
	currency: string | undefined,
): void => {
	// the error last reported, so that neither a re-render nor StrictMode's
	// second effect run reports it again
	const reportedRef = useRef<string | null>(null);
	useEffect(() => {
		if (!currencyError || disabled) return;
		const key = String(currencyError);
		if (reportedRef.current === key) return;
		reportedRef.current = key;
		captureError(currencyError, { source, extra: { style, currency } });
		// eslint-disable-next-line no-console
		console.error(
			`[Components-Care] [${source}] Missing or malformed currency, an ISO 4217 code is expected:`,
			currencyError,
		);
	}, [currencyError, disabled, source, style, currency]);
};

export default useCurrencyErrorReport;
