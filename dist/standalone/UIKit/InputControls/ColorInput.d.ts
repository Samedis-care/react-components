import React from "react";
import { TextFieldWithHelpProps } from "../TextFieldWithHelp";
import { TextFieldProps } from "@mui/material";
export type ColorInputProps = TextFieldWithHelpProps & Omit<TextFieldProps, "onChange" | "value" | "onClick" | "multiline"> & {
    /**
     * On Change event handler
     * @param newColor The new color or empty string
     */
    onChange: (newColor: string) => void;
    /**
     * The current color
     */
    value: string;
};
declare const _default: React.MemoExoticComponent<(props: ColorInputProps) => React.JSX.Element>;
export default _default;