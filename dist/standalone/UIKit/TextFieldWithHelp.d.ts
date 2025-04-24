import React from "react";
import { UIInputProps, UiKitTextField } from "./CommonStyles";
export interface TextFieldWithHelpProps extends UIInputProps {
    /**
     * Optional callback which opens a dialog with information about the field
     */
    openInfo?: () => void;
    /**
     * custom clear handler if clear button is pressed
     */
    customHandleClear?: () => void;
}
export declare const UiKitTextFieldWithWarnings: typeof UiKitTextField;
declare const _default: React.NamedExoticComponent<(Omit<TextFieldWithHelpProps & import("@mui/material").FilledTextFieldProps, "ref"> | Omit<TextFieldWithHelpProps & import("@mui/material").OutlinedTextFieldProps, "ref"> | Omit<TextFieldWithHelpProps & import("@mui/material").StandardTextFieldProps, "ref">) & React.RefAttributes<HTMLDivElement>>;
export default _default;
