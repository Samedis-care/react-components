import React from "react";
import { TextFieldProps } from "@mui/material";
import { TextFieldWithHelpProps } from "../TextFieldWithHelp";
export interface IntegerInputFieldProps extends TextFieldWithHelpProps {
    /**
     * The current value or null if not set. Shown in the components-care
     * language's number format, never in exponent form: 1e21 is
     * "1,000,000,000,000,000,000,000" in en, "1000000000000000000000" with
     * `noFormat`.
     */
    value: number | null;
    /**
     * Called on every keystroke with the whole number the text holds: its digits up to the
     * current locale's decimal separator, without group separators ("1,234.56" is 1234 in en,
     * "7,5" is 7 in de). A minus sign before the first digit makes it negative ("-56").
     * Digits typed after the decimal separator, and a minus without a digit yet, stay in the
     * text until the field loses focus, but are not part of the number.
     *
     * Not called while the whole number is outside `Number.MIN_SAFE_INTEGER` to
     * `Number.MAX_SAFE_INTEGER` (±9,007,199,254,740,991), where a `number` no longer holds
     * every digit: the parent keeps the value it has, and the field keeps the text as
     * typed, is marked invalid and shows "Enter a number from -9,007,199,254,740,991 to
     * 9,007,199,254,740,991" in place of `helperText`, also after it loses focus, until an
     * edit brings the number back into range or a new `value` arrives.
     * @param evt The change event; `evt.target.name` is the input's `name`
     * @param value The number, or `null` for text without a digit
     */
    onChange?: (evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, value: number | null) => void;
    /**
     * Shows the value without digit grouping (2026, not 2,026), e.g. for years
     * or numeric identifiers, and the range in the message for a number out of
     * range too
     * @default false
     */
    noFormat?: boolean;
}
declare const _default: React.MemoExoticComponent<(props: IntegerInputFieldProps & Omit<TextFieldProps, "onChange" | "value">) => React.JSX.Element>;
export default _default;
