import React from "react";
import { DatePickerProps } from "@mui/x-date-pickers";
import { Moment } from "moment";
type LocalizedDatePickerProps = Omit<DatePickerProps<Moment | null>, "format">;
declare const _default: React.MemoExoticComponent<React.ComponentType<LocalizedDatePickerProps & import("../UIKit/MuiWarning").MuiWarningResultProps>>;
export default _default;
