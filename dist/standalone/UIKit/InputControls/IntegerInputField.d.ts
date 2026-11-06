import React from "react";
import { TextFieldProps } from "@mui/material";
import { TextFieldWithHelpProps } from "../TextFieldWithHelp";
export interface IntegerInputFieldProps extends TextFieldWithHelpProps {
    /**
     * The current value or null if not set
     */
    value: number | null;
    /**
     * Called on every keystroke with the whole number the text holds: its digits up to the
     * current locale's decimal separator, without group separators ("1,234.56" is 1234 in en,
     * "7,5" is 7 in de). A minus sign before the first digit makes it negative ("-56").
     * Digits typed after the decimal separator, and a minus without a digit yet, stay in the
     * text until the field loses focus, but are not part of the number.
     * @param evt The change event; `evt.target.name` is the input's `name`
     * @param value The number, or `null` for text without a digit
     */
    onChange?: (evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, value: number | null) => void;
    /**
     * disable number formatting
     */
    noFormat?: boolean;
}
declare const _default: React.MemoExoticComponent<(props: IntegerInputFieldProps & Omit<TextFieldProps, "onChange" | "value">) => React.JSX.Element>;
export default _default;
