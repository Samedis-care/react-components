import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import React, { useMemo } from "react";
import useCurrentLocale from "../../utils/useCurrentLocale";
import formatLocalizedNumber from "../../utils/internal/formatLocalizedNumber";
import useCurrencyErrorReport from "./useCurrencyErrorReport";
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
    useCurrencyErrorReport("NumberFormatter", formatted?.currencyError ?? null, disableErrorReporting, options?.style, options?.currency);
    return _jsx(_Fragment, { children: formatted ? formatted.text : "" });
};
export default React.memo(NumberFormatter);
