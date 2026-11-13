import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import TextFieldWithHelp from "../TextFieldWithHelp";
import parseLocalizedNumber from "../../../utils/parseLocalizedNumber";
import useCurrentLocale from "../../../utils/useCurrentLocale";
import useCCTranslations from "../../../utils/useCCTranslations";
const CurrencyInput = (props) => {
    const { value, onChange, onBlur, currency, ...muiProps } = props;
    const { t } = useCCTranslations();
    const locale = useCurrentLocale();
    const numberFormatOptions = useMemo(() => ({
        style: "currency",
        currency,
    }), [currency]);
    const formatNumber = useCallback((value) => value != null ? value.toLocaleString(locale, numberFormatOptions) : "", [locale, numberFormatOptions]);
    const valueFormatted = formatNumber(value);
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
    const handleBlur = useCallback((evt) => {
        if (onBlur)
            onBlur(evt);
        if (lastChangeEvent) {
            const value = parseLocalizedNumber(valueInternal, numberFormatOptions);
            if (value != null && isNaN(value)) {
                setParseError(true);
            }
            else if (onChange) {
                setParseError(false);
                const formatted = formatNumber(value);
                // we parse here so decimal points are limited and view always matches data
                onChange(lastChangeEvent, parseLocalizedNumber(formatted, numberFormatOptions));
                setLastChangeEvent(null);
            }
        }
    }, [
        formatNumber,
        lastChangeEvent,
        numberFormatOptions,
        onBlur,
        onChange,
        valueInternal,
    ]);
    // component rendering
    return (_jsx(TextFieldWithHelp, { ...muiProps, value: lastChangeEvent ? valueInternal : valueFormatted, onChange: handleChange, onBlur: handleBlur, error: parseError || muiProps.error, helperText: parseError
            ? t("standalone.uikit.number-input.invalid", {
                EXAMPLE: formatNumber(1234.56),
            })
            : muiProps.helperText, slotProps: {
            ...muiProps.slotProps,
            htmlInput: {
                ...muiProps.slotProps?.htmlInput,
                inputMode: "decimal",
            },
        }, inputMode: "decimal" }));
};
export default React.memo(CurrencyInput);
