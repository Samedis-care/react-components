import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import React, { useEffect, useMemo, useRef } from "react";
import useCurrentLocale from "../../utils/useCurrentLocale";
import formatLocalizedNumber from "../../utils/internal/formatLocalizedNumber";
import { captureError } from "../../framework/ErrorReporting";
/**
 * Renders a number as plain text, formatted with
 * `Number.prototype.toLocaleString` for the current language of the
 * components-care i18n instance (see `useCurrentLocale`); it re-renders when
 * that language changes. For a formatted number inside a string (a tooltip,
 * an `aria-label`), call `value.toLocaleString(useCurrentLocale(), options)`.
 */
const NumberFormatter = (props) => {
    const { value, options, disableErrorReporting } = props;
    const locale = useCurrentLocale();
    const formatted = useMemo(() => value != null ? formatLocalizedNumber(value, locale, options) : null, [value, locale, options]);
    const currencyError = formatted?.currencyError ?? null;
    // the error last reported, so that neither a re-render nor StrictMode's
    // second effect run reports it again
    const reportedRef = useRef(null);
    const style = options?.style;
    const currency = options?.currency;
    useEffect(() => {
        if (!currencyError || disableErrorReporting)
            return;
        const key = String(currencyError);
        if (reportedRef.current === key)
            return;
        reportedRef.current = key;
        captureError(currencyError, {
            source: "NumberFormatter",
            extra: { style, currency },
        });
        // eslint-disable-next-line no-console
        console.error("[Components-Care] [NumberFormatter] Missing or malformed currency, an ISO 4217 code is expected:", currencyError);
    }, [currencyError, disableErrorReporting, style, currency]);
    return _jsx(_Fragment, { children: formatted ? formatted.text : "" });
};
export default React.memo(NumberFormatter);
