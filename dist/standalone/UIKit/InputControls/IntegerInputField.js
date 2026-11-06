import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useState } from "react";
import TextFieldWithHelp from "../TextFieldWithHelp";
import useInputCursorFix from "../../../utils/useInputCursorFix";
import useCurrentLocale from "../../../utils/useCurrentLocale";
import getNumberSeparator from "../../../utils/getNumberSeparator";
import isNegativeNumberText from "../../../utils/internal/isNegativeNumberText";
/**
 * Reads the whole number in a text the user typed into an IntegerInputField
 * @param text The text
 * @returns value: the digits up to the locale's decimal separator as a number, negative after a
 *          minus sign, 0 for a fraction without a whole part (".5") and for "-0", null without
 *          any digit; keepText: whether the text says more than the formatted value would (a
 *          decimal separator, or a minus the value can't show yet: "-", "-0")
 */
const parseInteger = (text) => {
    const separatorIndex = text.indexOf(getNumberSeparator("decimal"));
    const fraction = separatorIndex !== -1;
    const negative = isNegativeNumberText(text);
    const whole = (fraction ? text.slice(0, separatorIndex) : text).replace(/[^0-9]/g, "");
    const unsigned = whole !== "" ? parseInt(whole) : fraction && /[0-9]/.test(text) ? 0 : null;
    return {
        // no -0: it would be shown as "-0" and stored as 0
        value: negative && unsigned ? -unsigned : unsigned,
        keepText: fraction || (negative && !unsigned),
    };
};
const IntegerInputField = (props) => {
    const { value, onChange, onBlur, noFormat, ...muiProps } = props;
    const locale = useCurrentLocale();
    const valueFormatted = value != null
        ? noFormat
            ? value.toString(10)
            : value.toLocaleString(locale)
        : "";
    // the text the user typed while it says more than the formatted value: shown as typed until
    // the field loses focus, so digits typed after a decimal separator stay behind it instead of
    // joining the whole number, and a minus waits for its digits; only while it still reads as
    // the value (the parent may keep another one)
    const [typedText, setTypedText] = useState(null);
    const shownText = typedText !== null && parseInteger(typedText).value === value
        ? typedText
        : valueFormatted;
    const { handleCursorChange, cursorInputRef } = useInputCursorFix(shownText);
    // on change handling
    const handleChange = useCallback((event) => {
        handleCursorChange(event);
        if (!onChange)
            return;
        const { value: num, keepText } = parseInteger(event.target.value);
        setTypedText(keepText ? event.target.value : null);
        onChange(event, num);
    }, [onChange, handleCursorChange]);
    const handleBlur = useCallback((event) => {
        setTypedText(null);
        if (onBlur)
            onBlur(event);
    }, [onBlur]);
    // component rendering
    return (_jsx("div", { children: _jsx(TextFieldWithHelp, { ...muiProps, value: shownText, onChange: handleChange, onBlur: handleBlur, slotProps: {
                ...muiProps.slotProps,
                htmlInput: {
                    ...muiProps.slotProps?.htmlInput,
                    ref: cursorInputRef,
                    inputMode: "numeric",
                },
            }, inputMode: "numeric" }) }));
};
export default React.memo(IntegerInputField);
