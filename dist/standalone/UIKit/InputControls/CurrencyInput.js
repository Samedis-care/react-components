import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import TextFieldWithHelp from "../TextFieldWithHelp";
import parseLocalizedNumber from "../../../utils/parseLocalizedNumber";
import useCurrentLocale from "../../../utils/useCurrentLocale";
import useCCTranslations from "../../../utils/useCCTranslations";
import useCommitOnEnter from "../../../utils/internal/useCommitOnEnter";
import addSlotAttributes from "../../../utils/internal/addSlotAttributes";
import formatLocalizedNumber, { getCurrencyFallback, isWellFormedCurrency, removeCurrencyText, } from "../../../utils/internal/formatLocalizedNumber";
import useCurrencyErrorReport from "../useCurrencyErrorReport";
const CurrencyInput = (props) => {
    const { value, onChange, onBlur, onKeyDown, currency, disableErrorReporting, ...muiProps } = props;
    const { t } = useCCTranslations();
    const locale = useCurrentLocale();
    const numberFormatOptions = useMemo(() => ({
        style: "currency",
        currency,
    }), [currency]);
    // what the text is read back with: the options it is formatted with, or, for
    // a currency Intl rejects, the ones it is formatted with in their place
    const readFormat = useMemo(() => isWellFormedCurrency(currency)
        ? { options: numberFormatOptions, currencyText: null }
        : getCurrencyFallback(numberFormatOptions), [currency, numberFormatOptions]);
    const formatNumber = useCallback((value) => value != null
        ? formatLocalizedNumber(value, locale, numberFormatOptions).text
        : "", [locale, numberFormatOptions]);
    const parseNumber = useCallback((text) => parseLocalizedNumber(removeCurrencyText(text, locale, readFormat), readFormat.options), [locale, readFormat]);
    const formatted = useMemo(() => value != null
        ? formatLocalizedNumber(value, locale, numberFormatOptions)
        : null, [locale, numberFormatOptions, value]);
    const valueFormatted = formatted ? formatted.text : "";
    useCurrencyErrorReport("CurrencyInput", formatted?.currencyError ?? null, disableErrorReporting, "currency", currency);
    const [valueInternal, setValueInternal] = useState(valueFormatted);
    // set by a blur whose text does not parse, and shown as the helper text
    const [parseError, setParseError] = useState(false);
    // a new value, currency or language replaces the text, and with it its error
    useEffect(() => {
        setValueInternal(formatNumber(value));
        setParseError(false);
    }, [formatNumber, value]);
    const [lastChangeEvent, setLastChangeEvent] = useState(null);
    // on change handling
    const handleChange = useCallback((event) => {
        if (!onChange)
            return;
        setValueInternal(event.target.value);
        event.persist();
        setLastChangeEvent(event);
    }, [onChange]);
    // commits an edit: on the blur after it, and on Enter, as Enter in a form's input submits
    // the form without a blur
    const commit = useCallback(() => {
        if (lastChangeEvent) {
            const value = parseNumber(valueInternal);
            if (value != null && isNaN(value)) {
                setParseError(true);
            }
            else if (onChange) {
                setParseError(false);
                // we parse here so decimal points are limited and view always matches data
                onChange(lastChangeEvent, parseNumber(formatNumber(value)));
                setLastChangeEvent(null);
            }
        }
    }, [formatNumber, lastChangeEvent, onChange, parseNumber, valueInternal]);
    const handleBlur = useCallback((evt) => {
        if (onBlur)
            onBlur(evt);
        commit();
    }, [commit, onBlur]);
    const handleKeyDown = useCommitOnEnter(commit, onKeyDown);
    // component rendering
    return (_jsx(TextFieldWithHelp, { ...muiProps, value: lastChangeEvent ? valueInternal : valueFormatted, onChange: handleChange, onBlur: handleBlur, onKeyDown: handleKeyDown, error: parseError || muiProps.error, helperText: parseError
            ? t("standalone.uikit.number-input.invalid", {
                EXAMPLE: formatNumber(1234.56),
            })
            : muiProps.helperText, slotProps: addSlotAttributes(muiProps.slotProps, "htmlInput", {
            inputMode: "decimal",
        }), inputMode: "decimal" }));
};
export default React.memo(CurrencyInput);
