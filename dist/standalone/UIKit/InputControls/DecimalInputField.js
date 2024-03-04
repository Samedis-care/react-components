import React, { useCallback, useState } from "react";
import TextFieldWithHelp from "../TextFieldWithHelp";
import getNumberSeparator from "../../../utils/getNumberSeparator";
import parseLocalizedNumber from "../../../utils/parseLocalizedNumber";
import useInputCursorFix from "../../../utils/useInputCursorFix";
import useCCTranslations from "../../../utils/useCCTranslations";
const DecimalInputField = (props) => {
    const { i18n } = useCCTranslations();
    const { value, onChange, ...muiProps } = props;
    const decimalSeparator = getNumberSeparator("decimal");
    const [danglingDecimalSeparator, setDanglingDecimalSeparator] = useState(false);
    const valueFormatted = value !== null
        ? value.toLocaleString(i18n.language) +
            (danglingDecimalSeparator && !muiProps.disabled ? decimalSeparator : "")
        : "";
    const { handleCursorChange, cursorInputRef } = useInputCursorFix(valueFormatted);
    // on change handling
    const handleChange = useCallback((event) => {
        handleCursorChange(event);
        if (!onChange)
            return;
        setDanglingDecimalSeparator(event.target.value.endsWith(decimalSeparator));
        onChange(event, parseLocalizedNumber(event.target.value));
    }, [onChange, handleCursorChange, decimalSeparator]);
    return (React.createElement(TextFieldWithHelp, { ...muiProps, value: valueFormatted, onChange: handleChange, inputProps: {
            ...muiProps.inputProps,
            ref: cursorInputRef,
        } }));
};
export default React.memo(DecimalInputField);
