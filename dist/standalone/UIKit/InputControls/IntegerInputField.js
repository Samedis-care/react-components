import React, { useCallback } from "react";
import TextFieldWithHelp from "../TextFieldWithHelp";
import useInputCursorFix from "../../../utils/useInputCursorFix";
import useCCTranslations from "../../../utils/useCCTranslations";
const IntegerInputField = (props) => {
    const { i18n } = useCCTranslations();
    const { value, onChange, ...muiProps } = props;
    const valueFormatted = value != null ? value.toLocaleString(i18n.language) : "";
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
            } })));
};
export default React.memo(IntegerInputField);
