import React from "react";
import { DateTimePickerProps } from "@material-ui/pickers";
declare type LocalizedDateTimePickerProps = Omit<DateTimePickerProps, "invalidLabel" | "cancelLabel" | "clearLabel" | "okLabel" | "todayLabel" | "invalidDateMessage" | "minDateMessage" | "maxDateMessage" | "format" | "refuse" | "rifmFormatter">;
declare const _default: React.MemoExoticComponent<React.ComponentType<LocalizedDateTimePickerProps & import("../UIKit").MuiWarningResultProps>>;
export default _default;
