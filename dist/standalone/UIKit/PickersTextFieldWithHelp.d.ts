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
     * Disable clear button on mobile
     */
    disableClearable?: boolean;
}
export declare const UiKitPickersTextFieldWithWarnings: typeof UiKitPickersTextField;
declare const TextFieldWithHelp: React.ForwardRefExoticComponent<PickersTextFieldWithHelpProps & PickersTextFieldProps & React.RefAttributes<HTMLDivElement>>;
declare const _default: typeof TextFieldWithHelp;
export default _default;
