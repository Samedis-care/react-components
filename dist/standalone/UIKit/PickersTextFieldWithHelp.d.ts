import React from "react";
import { UIInputProps, UiKitPickersTextField } from "./CommonStyles";
import { PickersTextFieldProps } from "@mui/x-date-pickers";
export interface PickersTextFieldWithHelpProps extends UIInputProps {
    /**
     * Optional callback which opens a dialog with information about the field
     */
    openInfo?: () => void;
    /**
     * custom clear handler if clear button is pressed
     */
    customHandleClear: () => void;
    /**
     * Hides the Clear button. That button is only rendered on touch devices,
     * while the field has a value and is neither disabled nor read-only (the
     * picker's `readOnly`, which reaches the field as `slotProps.input.readOnly`).
     * @default false
     */
    disableClearable?: boolean;
}
export declare const UiKitPickersTextFieldWithState: typeof UiKitPickersTextField;
declare const TextFieldWithHelp: React.ForwardRefExoticComponent<PickersTextFieldWithHelpProps & PickersTextFieldProps & React.RefAttributes<HTMLDivElement>>;
declare const _default: typeof TextFieldWithHelp;
export default _default;
