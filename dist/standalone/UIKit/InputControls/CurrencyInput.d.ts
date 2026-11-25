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
     * rounded to the currency's minor units, or `null` for an emptied field
     * (nothing but the currency symbol left counts as empty).
     * Enter after an edit calls it too, before a form around the field submits:
     * the field then shows the amount the parent keeps, as after a blur, and
     * the next blur calls it only after a further edit.
     * Typing does not call it, emptying the field and the touch Clear button
     * included, and neither does a blur or Enter without an edit. `onBlur`, if
     * given, runs first on a blur. Not called when the text is no number
     * (`"abc"`, `"-"`, `"."`): the field keeps the previous amount and shows a
     * message in place of `helperText` until a valid edit or a new `value`,
     * `currency` or language.
     * @param evt The last change event of the edit, not the blur or keydown event
     * @param value The amount, or `null` for an empty field
     */
    onChange?: (evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, value: number | null) => void;
}
declare const _default: React.MemoExoticComponent<(props: CurrencyInputProps & Omit<TextFieldProps, "onChange" | "value">) => React.JSX.Element>;
export default _default;
