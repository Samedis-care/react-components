import React, { useCallback, useEffect, useMemo, useState } from "react";
import TextFieldWithHelp from "../TextFieldWithHelp";
import parseLocalizedNumber from "../../../utils/parseLocalizedNumber";
import useCurrentLocale from "../../../utils/useCurrentLocale";
const CurrencyInput = (props) => {
    const { value, onChange, onBlur, currency, ...muiProps } = props;
    const locale = useCurrentLocale();
    const numberFormatOptions = useMemo(() => ({
        style: "currency",
        currency,
    }), [currency]);
    const formatNumber = useCallback((value) => value != null ? value.toLocaleString(locale, numberFormatOptions) : "", [locale, numberFormatOptions]);
    const valueFormatted = formatNumber(value);
    const [valueInternal, setValueInternal] = useState(valueFormatted);
    useEffect(() => setValueInternal(formatNumber(value)), [formatNumber, value]);
    const [lastChangeEvent, setLastChangeEvent] = useState(null);
    const [error, setError] = useState(false);
    // on change handling
    const handleChange = useCallback((event) => {
        if (!onChange)
            return;
        setValueInternal(event.target.value);
        event.persist();
        setLastChangeEvent(event);
        if (!event.target.value) {
            onChange(event, null);
        }
    }, [onChange]);
    const handleBlur = useCallback((evt) => {
        if (onBlur)
            onBlur(evt);
        if (lastChangeEvent) {
            const value = parseLocalizedNumber(valueInternal, numberFormatOptions);
            if (value != null && isNaN(value)) {
                setError(true);
            }
            else if (onChange) {
                setError(false);
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
    return (React.createElement(TextFieldWithHelp, { ...muiProps, value: lastChangeEvent ? valueInternal : valueFormatted, onChange: handleChange, onBlur: handleBlur, error: error || muiProps.error, slotProps: {
            ...muiProps.slotProps,
            htmlInput: {
                ...muiProps.slotProps?.htmlInput,
                inputMode: "numeric",
            },
        }, inputMode: "numeric" }));
};
export default React.memo(CurrencyInput);
