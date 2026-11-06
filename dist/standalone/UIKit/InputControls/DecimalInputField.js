import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useState } from "react";
import TextFieldWithHelp from "../TextFieldWithHelp";
import parseLocalizedNumber from "../../../utils/parseLocalizedNumber";
import useCurrentLocale from "../../../utils/useCurrentLocale";
const DecimalInputField = (props) => {
    const { value, onChange, onBlur, format, ...muiProps } = props;
    const locale = useCurrentLocale();
    // the text typed since the last commit, or null while the field is not edited. Only
    // an edit is committed, so tabbing through the field never stores the shown (rounded)
    // text in place of the value. Without an edit the text is derived from value, locale
    // and format on every render.
    const [draft, setDraft] = useState(null);
    // a new value replaces the typed text (Object.is, so a NaN value is no change)
    const [draftValue, setDraftValue] = useState(value);
    if (!Object.is(draftValue, value)) {
        setDraftValue(value);
        setDraft(null);
    }
    const text = draft ?? (value !== null ? value.toLocaleString(locale, format) : "");
    const handleBlur = useCallback((event) => {
        if (onBlur)
            onBlur(event);
        if (draft === null || !onChange)
            return;
        // shows the value the parent keeps from here on, even when it does not change
        setDraft(null);
        onChange(event, parseLocalizedNumber(event.target.value));
    }, [draft, onBlur, onChange]);
    // on change handling
    const handleChange = useCallback((event) => {
        setDraft(event.target.value);
    }, []);
    return (_jsx(TextFieldWithHelp, { ...muiProps, value: text, onChange: handleChange, onBlur: handleBlur, slotProps: {
            ...muiProps.slotProps,
            htmlInput: {
                ...muiProps.slotProps?.htmlInput,
                inputMode: "decimal",
            },
        }, inputMode: "decimal" }));
};
export default React.memo(DecimalInputField);
