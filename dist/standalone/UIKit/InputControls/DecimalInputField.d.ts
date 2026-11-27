import React from "react";
import { TextFieldProps } from "@mui/material";
import { TextFieldWithHelpProps } from "../TextFieldWithHelp";
export interface DecimalInputFieldProps extends TextFieldWithHelpProps {
    /**
     * The number, or `null` for an empty field (`undefined`, which untyped data
     * can hold, is taken as `null`). While the user is not editing the text,
     * the field shows this value formatted with `format` in the
     * components-care language, and follows every change of the three. After a
     * commit it shows the value the parent keeps, which can differ from the
     * typed text (a clamped or rounded number). A new value also replaces text
     * the user is typing.
     */
    value: number | null;
    /**
     * `Intl.NumberFormatOptions` for the shown text, e.g.
     * `{ maximumFractionDigits: 2 }`. Read on every render. The typed text is
     * read with the same options, so the field reads its own text back: with
     * `{ style: "percent" }` the value 0.75 shows as "75%", and a typed "80%"
     * or "80" is 0.8; the symbols of a currency, unit or percent format may be
     * typed or left out. Takes no `notation`, `compactDisplay` or
     * `currencySign`: their text ("1.2K", "($5.00)") does not read back as the
     * number.
     * @default undefined (at most 3 fraction digits, grouped)
     */
    format?: Omit<Intl.NumberFormatOptions, "notation" | "compactDisplay" | "currencySign">;
    /**
     * Called on the blur after the user edited the text, with the number the
     * text shows in `format`, and on Enter after an edit, before a form around
     * the field submits (the field then shows the value the parent keeps, as
     * after a blur, and the next blur calls it only after a further edit).
     * Typing alone, and a blur or Enter without an edit, never call it. Not
     * called when the text does not parse (a separator without a digit, such
     * as `"."`): the field keeps the text and the previous value, and shows a
     * message in place of `helperText` until a valid edit or a new `value`.
     * @param evt The blur event, or the keydown event of Enter, although typed
     * as a change event; `evt.target` is the input, so `evt.target.name` is its
     * `name`
     * @param value The number; `null` for an empty field, or one with nothing
     * but the symbols of `format` (such as `"%"`)
     */
    onChange?: (evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, value: number | null) => void;
}
declare const _default: React.MemoExoticComponent<(props: DecimalInputFieldProps & Omit<TextFieldProps, "onChange" | "value">) => React.JSX.Element>;
export default _default;
