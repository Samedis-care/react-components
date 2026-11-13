import React from "react";
import { UIInputProps, UiKitTextField } from "./CommonStyles";
export interface TextFieldWithHelpProps extends UIInputProps {
    /**
     * Optional callback which opens a dialog with information about the field
     */
    openInfo?: () => void;
    /**
     * Replaces what the touch Clear button does: called without arguments
     * when it is pressed. Without it, the button empties the text input, so
     * `onChange` receives an event whose `target.value` is `""`.
     *
     * A `select` has no such default: it shows the Clear button only when
     * this is set.
     */
    customHandleClear?: () => void;
    /**
     * Hides the Clear button. That button is only rendered on touch devices,
     * while the field shows a value (`0` included) and its input can be
     * edited: not while the field is `disabled`, nor while `slotProps.input`
     * or `slotProps.htmlInput` sets `readOnly` or `disabled`. In a `select`
     * only with `customHandleClear`.
     * @default false
     */
    disableClearable?: boolean;
}
export declare const UiKitTextFieldWithState: typeof UiKitTextField;
declare const _default: React.NamedExoticComponent<(Omit<TextFieldWithHelpProps & import("@mui/material").FilledTextFieldProps, "ref"> | Omit<TextFieldWithHelpProps & import("@mui/material").OutlinedTextFieldProps, "ref"> | Omit<TextFieldWithHelpProps & import("@mui/material").StandardTextFieldProps, "ref">) & React.RefAttributes<HTMLDivElement>>;
export default _default;
