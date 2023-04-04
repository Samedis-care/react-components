import React from "react";
import { KeyboardDatePickerProps } from "@material-ui/pickers";
import { TextFieldWithHelpProps } from "../TextFieldWithHelp";
export interface DateInputProps extends TextFieldWithHelpProps {
    /**
     * The value of the input
     */
    value: Date | null;
    /**
     * Set new value of the input
     * @param date new value
     */
    onChange: (date: Date | null) => void;
    /**
     * Boolean flag to hide Calendar Icon (only used if disabled is truthy)
     */
    hideDisabledIcon?: boolean;
}
declare const _default: React.MemoExoticComponent<(props: DateInputProps & Omit<KeyboardDatePickerProps, "onChange" | "value">) => JSX.Element>;
export default _default;
