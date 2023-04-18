import React from "react";
import { TextFieldProps } from "@mui/material";
import { TextFieldWithHelpProps } from "../TextFieldWithHelp";
export interface CurrencyInputProps extends TextFieldWithHelpProps {
    /**
     * The currency to be used in formatting
     */
    currency: string;
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
declare const _default: React.MemoExoticComponent<(props: CurrencyInputProps & Omit<TextFieldProps, "onChange" | "value">) => JSX.Element>;
export default _default;
