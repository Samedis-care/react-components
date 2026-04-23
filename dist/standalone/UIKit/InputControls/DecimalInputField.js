import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useEffect, useState } from "react";
import TextFieldWithHelp from "../TextFieldWithHelp";
import parseLocalizedNumber from "../../../utils/parseLocalizedNumber";
import useCurrentLocale from "../../../utils/useCurrentLocale";
const DecimalInputField = (props) => {
    const { value, onChange, format, ...muiProps } = props;
    const locale = useCurrentLocale();
    const [valueInternal, setValueInternal] = useState("");
    useEffect(() => {
        setValueInternal(value !== null ? value.toLocaleString(locale, format) : "");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);
    const handleBlur = useCallback((event) => {
        if (!onChange)
            return;
        onChange(event, parseLocalizedNumber(event.target.value));
    }, [onChange]);
    // on change handling
    const handleChange = useCallback((event) => {
        setValueInternal(event.target.value);
    }, []);
    return (_jsx(TextFieldWithHelp, { ...muiProps, value: valueInternal, onChange: handleChange, onBlur: handleBlur, slotProps: {
            ...muiProps.slotProps,
            htmlInput: {
                ...muiProps.slotProps?.htmlInput,
                inputMode: "numeric",
            },
        }, inputMode: "numeric" }));
};
export default React.memo(DecimalInputField);
