import React from "react";
import { TextFieldProps } from "@mui/material";
import { TextFieldWithHelpProps } from "../TextFieldWithHelp";
export interface CurrencyInputProps extends TextFieldWithHelpProps {
    /**
     * The currency to be used in formatting
     */
    currency: string;
    /**
     * The current value or null if not set
     */
    value: number | null;
    /**
     * Called once on the blur after the user edited the text, with the amount
     * rounded to the currency's minor units, or `null` for an emptied field.
     * Typing does not call it, emptying the field and the touch Clear button
     * included, and neither does a blur without an edit. `onBlur`, if given,
     * runs first. Not called when the text does not parse (`"."`): the field
     * keeps the previous amount and shows a message in place of `helperText`
     * until a valid edit or a new `value`, `currency` or language.
     * @param evt The last change event of the edit, not the blur event
     * @param value The amount, or `null` for an empty field
     */
    onChange?: (evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, value: number | null) => void;
}
declare const _default: React.MemoExoticComponent<(props: CurrencyInputProps & Omit<TextFieldProps, "onChange" | "value">) => React.JSX.Element>;
export default _default;
