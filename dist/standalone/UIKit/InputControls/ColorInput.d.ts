import React from "react";
import { TextFieldWithHelpProps } from "../TextFieldWithHelp";
import { TextFieldProps } from "@mui/material";
export type ColorInputProps = TextFieldWithHelpProps & Omit<TextFieldProps, "onChange" | "value" | "onClick" | "multiline" | "onBlur"> & {
    /**
     * Called with the new color text: per keystroke with the text as typed,
     * per change in the picker with lowercase `#rrggbb`, and with `""` from
     * the Clear button on touch devices. The text is not checked, as in
     * MUI's TextField: pass `error` and `helperText` for text that is no
     * color. A model form's color field (`TypeColor`) does.
     * @param newColor The new color, or an empty string
     */
    onChange: (newColor: string) => void;
    /**
     * The current color, as text (e.g. `#336699`). `""` or `null` for none,
     * which shows an empty field; `undefined` (from untyped data) is treated
     * like `null`.
     */
    value: string | null;
    /**
     * Called once focus leaves the field: from the input or a button of the
     * field to anything outside the field and its open picker. Moving
     * between the input and the buttons, and into the open picker and back,
     * is not leaving, so a color picked in the picker has already been
     * reported through `onChange` when this is called.
     *
     * Receives the blur event of the field's input root
     * (`.MuiInputBase-root`, the `currentTarget`), which carries `name` as
     * `data-name`, so Form's `handleBlur` can be passed as it is; `target`
     * is the element that lost focus, the input or one of the buttons. Read
     * the color from `value`, not from the event. A blur handler set on the
     * input root (`slotProps.input.slotProps.root.onBlur`) is kept and still
     * sees every blur of the root.
     */
    onBlur?: React.FocusEventHandler<HTMLElement>;
};
/**
 * A text field for a color, with react-color's `ChromePicker` in a popover
 * below it. The palette button at the end of the field ("Choose color", in
 * the library's language) opens the picker, from the pointer or the keyboard,
 * and so does a click anywhere in the field; neither while `disabled`. The
 * open picker is a modal dialog named after the field's label. It takes focus,
 * and shows a focus ring when the keyboard opened it. Escape or a
 * click outside closes it, and focus returns to where it was. `onBlur` is
 * called once focus leaves the field, the open picker counting as part of it.
 */
declare const _default: React.MemoExoticComponent<(props: ColorInputProps) => React.JSX.Element>;
export default _default;
