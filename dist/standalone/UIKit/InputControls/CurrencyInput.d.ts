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
     * The change event handler. Not called when the text does not parse
     * (`"."`): the field keeps the previous amount and shows a message in
     * place of `helperText` until a valid edit or a new `value`, `currency` or
     * language.
     * @param evt
     * @param value
     */
    onChange?: (evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, value: number | null) => void;
}
declare const _default: React.MemoExoticComponent<(props: CurrencyInputProps & Omit<TextFieldProps, "onChange" | "value">) => React.JSX.Element>;
export default _default;
