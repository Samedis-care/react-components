import React from "react";
import { DatePickerProps } from "@mui/x-date-pickers";
export interface LocalizedDatePickerProps extends Omit<DatePickerProps, "format"> {
    /**
     * Report every keystroke, rather than only dates the user finished entering.
     * See {@link usePickerDraft}.
     */
    publishIntermediateValues?: boolean;
}
declare const _default: React.MemoExoticComponent<React.ComponentType<LocalizedDatePickerProps & import("..").MuiWarningResultProps>>;
export default _default;
