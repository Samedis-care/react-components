import React, { useCallback, useEffect, useState } from "react";
import TextFieldWithHelp from "../TextFieldWithHelp";
import parseLocalizedNumber from "../../../utils/parseLocalizedNumber";
import useCCTranslations from "../../../utils/useCCTranslations";
const DecimalInputField = (props) => {
    const { i18n } = useCCTranslations();
    const { value, onChange, format, ...muiProps } = props;
    const [valueInternal, setValueInternal] = useState("");
    useEffect(() => {
        setValueInternal(value !== null ? value.toLocaleString(i18n.language, format) : "");
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
    return (React.createElement(TextFieldWithHelp, { ...muiProps, value: valueInternal, onChange: handleChange, onBlur: handleBlur, inputProps: {
            ...muiProps.inputProps,
            inputMode: "numeric",
        }, inputMode: "numeric" }));
};
export default React.memo(DecimalInputField);
