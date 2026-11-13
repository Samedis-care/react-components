import React from "react";
import { TextFieldWithHelpProps } from "../TextFieldWithHelp";
import { TextFieldProps } from "@mui/material";
export type ColorInputProps = TextFieldWithHelpProps & Omit<TextFieldProps, "onChange" | "value" | "onClick" | "multiline"> & {
    /**
     * On Change event handler
     * @param newColor The new color or empty string
     */
    onChange: (newColor: string) => void;
    /**
     * The current color, as text (e.g. `#336699`). `""` or `null` for none,
     * which shows an empty field; `undefined` (from untyped data) is treated
     * like `null`.
     */
    value: string | null;
};
/**
 * A text field for a color, with react-color's `ChromePicker` in a popover
 * below it. The palette button at the end of the field ("Choose color", in
 * the library's language) opens the picker, from the pointer or the keyboard,
 * and so does a click anywhere in the field; neither while `disabled`. The
 * open picker is a modal dialog named after the field's label. Escape or a
 * click outside closes it, and focus returns to where it was.
 */
declare const _default: React.MemoExoticComponent<(props: ColorInputProps) => React.JSX.Element>;
export default _default;
