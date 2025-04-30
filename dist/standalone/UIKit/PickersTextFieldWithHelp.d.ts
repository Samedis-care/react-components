import React from "react";
import { UIInputProps, UiKitPickersTextField } from "./CommonStyles";
export interface PickersTextFieldWithHelpProps extends UIInputProps {
    /**
     * Optional callback which opens a dialog with information about the field
     */
    openInfo?: () => void;
    /**
     * custom clear handler if clear button is pressed
     */
    customHandleClear: () => void;
}
export declare const UiKitPickersTextFieldWithWarnings: typeof UiKitPickersTextField;
declare const _default: React.NamedExoticComponent<(Omit<PickersTextFieldWithHelpProps & import("@mui/x-date-pickers/PickersTextField/PickersTextField.types").PickersFilledTextFieldProps, "ref"> | Omit<PickersTextFieldWithHelpProps & import("@mui/x-date-pickers/PickersTextField/PickersTextField.types").PickersOutlinedTextFieldProps, "ref"> | Omit<PickersTextFieldWithHelpProps & import("@mui/x-date-pickers/PickersTextField/PickersTextField.types").PickersStandardTextFieldProps, "ref">) & React.RefAttributes<HTMLDivElement>>;
export default _default;
