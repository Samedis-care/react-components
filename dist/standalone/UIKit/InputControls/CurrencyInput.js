import React, { useCallback, useEffect, useState } from "react";
import TextFieldWithHelp from "../TextFieldWithHelp";
import parseLocalizedNumber from "../../../utils/parseLocalizedNumber";
import useCCTranslations from "../../../utils/useCCTranslations";
const CurrencyInput = (props) => {
    const { value, onChange, onBlur, currency, ...muiProps } = props;
    const { i18n } = useCCTranslations();
    const formatNumber = useCallback((value) => value != null
        ? value.toLocaleString(i18n.language, {
            style: "currency",
            currency,
        })
        : "", [currency, i18n.language]);
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
    }, [onChange]);
    const handleBlur = useCallback((evt) => {
        if (onBlur)
            onBlur(evt);
        if (lastChangeEvent) {
            const value = parseLocalizedNumber(valueInternal);
            if (value != null && isNaN(value)) {
                setError(true);
            }
            else if (onChange) {
                setError(false);
                const formatted = formatNumber(value);
                // we parse here so decimal points are limited and view always matches data
                onChange(lastChangeEvent, parseLocalizedNumber(formatted));
            }
        }
    }, [formatNumber, lastChangeEvent, onBlur, onChange, valueInternal]);
    // component rendering
    return (React.createElement("div", null,
        React.createElement(TextFieldWithHelp, { ...muiProps, value: valueInternal, onChange: handleChange, onBlur: handleBlur, error: error || muiProps.error })));
};
export default React.memo(CurrencyInput);
