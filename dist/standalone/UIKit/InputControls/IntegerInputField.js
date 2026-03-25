import React, { useCallback } from "react";
import TextFieldWithHelp from "../TextFieldWithHelp";
import useInputCursorFix from "../../../utils/useInputCursorFix";
import useCurrentLocale from "../../../utils/useCurrentLocale";
const IntegerInputField = (props) => {
    const { value, onChange, noFormat, ...muiProps } = props;
    const locale = useCurrentLocale();
    const valueFormatted = value != null
        ? noFormat
            ? value.toString(10)
            : value.toLocaleString(locale)
        : "";
    const { handleCursorChange, cursorInputRef } = useInputCursorFix(valueFormatted);
    // on change handling
    const handleChange = useCallback((event) => {
        handleCursorChange(event);
        if (!onChange)
            return;
        const num = event.target.value.replace(/[^0-9]/g, "");
        if (num != "") {
            const numericValue = parseInt(num);
            onChange(event, numericValue);
        }
        else {
            onChange(event, null);
        }
    }, [onChange, handleCursorChange]);
    // component rendering
    return (React.createElement("div", null,
        React.createElement(TextFieldWithHelp, { ...muiProps, value: valueFormatted, onChange: handleChange, inputProps: {
                ...muiProps.inputProps,
                ref: cursorInputRef,
                inputMode: "numeric",
            }, inputMode: "numeric" })));
};
export default React.memo(IntegerInputField);
