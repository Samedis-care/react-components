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
     * The current color, as text (e.g. `#336699`). `""` or `null` for none,
     * which shows an empty field; `undefined` (from untyped data) is treated
     * like `null`.
     */
    value: string | null;
};
declare const _default: React.MemoExoticComponent<(props: ColorInputProps) => React.JSX.Element>;
export default _default;
