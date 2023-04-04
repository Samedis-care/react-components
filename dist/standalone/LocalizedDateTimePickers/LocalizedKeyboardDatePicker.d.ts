import React from "react";
import { KeyboardDatePickerProps } from "@material-ui/pickers";
export interface LocalizedKeyboardDatePickerProps extends Omit<KeyboardDatePickerProps, "invalidLabel" | "cancelLabel" | "clearLabel" | "okLabel" | "todayLabel" | "invalidDateMessage" | "minDateMessage" | "maxDateMessage" | "format" | "refuse" | "rifmFormatter"> {
    /**
     * Boolean flag to hide Calendar Icon (only used if disabled is truthy)
     */
    hideDisabledIcon?: boolean;
}
declare const _default: React.MemoExoticComponent<React.ComponentType<LocalizedKeyboardDatePickerProps & import("../UIKit").MuiWarningResultProps>>;
export default _default;
