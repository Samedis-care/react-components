import React from "react";
import { TextFieldProps } from "@mui/material";
import { TextFieldWithHelpProps } from "../TextFieldWithHelp";
export interface IntegerInputFieldProps extends TextFieldWithHelpProps {
    /**
     * The current value or null if not set
     */
    value: number | null;
    /**
     * The change event handler
     * @param evt
     * @param value
     */
    onChange?: (evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, value: number | null) => void;
}
declare const _default: React.MemoExoticComponent<(props: IntegerInputFieldProps & Omit<TextFieldProps, "onChange" | "value">) => JSX.Element>;
export default _default;
