import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useState } from "react";
import TextFieldWithHelp from "../TextFieldWithHelp";
import parseLocalizedNumber from "../../../utils/parseLocalizedNumber";
import useCurrentLocale from "../../../utils/useCurrentLocale";
import useCCTranslations from "../../../utils/useCCTranslations";
const DecimalInputField = (props) => {
    const { value, onChange, onBlur, format, ...muiProps } = props;
    const { t } = useCCTranslations();
    const locale = useCurrentLocale();
    // the text typed since the last commit, or null while the field is not edited. Only
    // an edit is committed, so tabbing through the field never stores the shown (rounded)
    // text in place of the value. Without an edit the text is derived from value, locale
    // and format on every render.
    const [draft, setDraft] = useState(null);
    // set by a blur whose text does not parse, and shown as the helper text while that
    // text stays
    const [parseError, setParseError] = useState(false);
    // a new value replaces the typed text, and with it its error (Object.is, so a NaN
    // value is no change)
    const [draftValue, setDraftValue] = useState(value);
    if (!Object.is(draftValue, value)) {
        setDraftValue(value);
        setDraft(null);
        setParseError(false);
    }
    const text = draft ?? (value !== null ? value.toLocaleString(locale, format) : "");
    const handleBlur = useCallback((event) => {
        if (onBlur)
            onBlur(event);
        if (draft === null || !onChange)
            return;
        const parsed = parseLocalizedNumber(event.target.value);
        if (parsed !== null && Number.isNaN(parsed)) {
            // keeps the text, and with it the previous value, until a valid edit
            setParseError(true);
            return;
        }
        setParseError(false);
        // shows the value the parent keeps from here on, even when it does not change
        setDraft(null);
        onChange(event, parsed);
    }, [draft, onBlur, onChange]);
    // on change handling
    const handleChange = useCallback((event) => {
        setDraft(event.target.value);
    }, []);
    return (_jsx(TextFieldWithHelp, { ...muiProps, value: text, onChange: handleChange, onBlur: handleBlur, error: parseError || muiProps.error, helperText: parseError
            ? t("standalone.uikit.number-input.invalid", {
                EXAMPLE: (1234.56).toLocaleString(locale, format),
            })
            : muiProps.helperText, slotProps: {
            ...muiProps.slotProps,
            htmlInput: {
                ...muiProps.slotProps?.htmlInput,
                inputMode: "decimal",
            },
        }, inputMode: "decimal" }));
};
export default React.memo(DecimalInputField);
