import React from "react";
/**
 * Props of {@link NumberFormatter}
 */
export interface NumberFormatterProps {
    /**
     * The number to format. `null` and `undefined` render nothing, without a
     * placeholder; `NaN` and `Infinity` are printed as `Intl` prints them,
     * "NaN" and "∞" (with a currency: "€NaN" in en, "NaN €" in de).
     */
    value: number | null | undefined;
    /**
     * Options of `Intl.NumberFormat` (`style`, `currency`,
     * `minimumFractionDigits`, …); without them at most 3 fraction digits are
     * shown. The locale cannot be set here.
     *
     * `currency` is an ISO 4217 code (`"EUR"`); a well-formed code `Intl` does
     * not know (`"XYZ"`) is printed as the code. With `style: "currency"`, a
     * currency that `Intl` rejects does not throw:
     * - a text that is not three letters (`"EURO"`, `"€"`) is printed as if it
     *   were a code, where the language puts one ("EURO 1,234.50" in en,
     *   "1.234,50 EURO" in de);
     * - a missing one (`undefined`, `null` or `""`) leaves the currency out:
     *   the plain amount ("1,234.50").
     *
     * Both get two fraction digits unless `minimumFractionDigits` or
     * `maximumFractionDigits` set others, and are reported (see
     * `disableErrorReporting`). Options that are invalid for another reason
     * throw while rendering, as `toLocaleString` does.
     */
    options?: Intl.NumberFormatOptions;
    /**
     * Don't report a currency that `Intl` rejects (see `options`), for a value
     * whose currency may be missing on purpose.
     *
     * By default (`false`) each NumberFormatter reports it once, not again on a
     * re-render with the same currency: to the error reporter (source
     * "NumberFormatter", extra `{ style, currency }`; Sentry unless the app
     * calls `configureErrorReporting`) and through `console.error`. With
     * `true` it does neither; the output is the same.
     */
    disableErrorReporting?: boolean;
}
declare const _default: React.MemoExoticComponent<(props: NumberFormatterProps) => React.JSX.Element>;
export default _default;
