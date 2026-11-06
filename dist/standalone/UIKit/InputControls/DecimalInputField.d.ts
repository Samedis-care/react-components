import React from "react";
import { TextFieldProps } from "@mui/material";
import { TextFieldWithHelpProps } from "../TextFieldWithHelp";
export interface DecimalInputFieldProps extends TextFieldWithHelpProps {
    /**
     * The number, or `null` for an empty field. While the user is not editing
     * the text, the field shows this value formatted with `format` in the
     * components-care language, and follows every change of the three. After a
     * commit it shows the value the parent keeps, which can differ from the
     * typed text (a clamped or rounded number). A new value also replaces text
     * the user is typing.
     */
    value: number | null;
    /**
     * `Intl.NumberFormatOptions` for the shown text, e.g.
     * `{ maximumFractionDigits: 2 }`. Read on every render.
     * @default undefined (at most 3 fraction digits, grouped)
     */
    format?: Intl.NumberFormatOptions;
    /**
     * Called on the blur after the user edited the text, with the parsed text.
     * Typing alone, and a blur without an edit, never call it.
     * @param evt The blur event, although typed as a change event;
     * `evt.target.name` is the input's `name`
     * @param value The number; `null` for an empty field or text without a digit
     */
    onChange?: (evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, value: number | null) => void;
}
declare const _default: React.MemoExoticComponent<(props: DecimalInputFieldProps & Omit<TextFieldProps, "onChange" | "value">) => React.JSX.Element>;
export default _default;
