import { InputLabelProps, InputProps, OutlinedInputProps, TextFieldProps } from "@mui/material";
import React from "react";
export interface UIInputProps {
    important?: boolean;
    warning?: boolean;
}
export type UiKitInputClassKey = "root";
export type UiKitInputProps = UIInputProps & InputProps;
export type UiKitInputOutlinedClassKey = "root";
export type UiKitInputOutlinedProps = UIInputProps & OutlinedInputProps;
export type UiKitTextFieldClassKey = "root";
export type UiKitTextFieldProps = UIInputProps & TextFieldProps;
export declare const UiKitInput: React.ComponentType<UiKitInputProps>;
export declare const UiKitInputOutlined: React.ComponentType<UiKitInputOutlinedProps>;
export declare const UiKitTextField: React.ComponentType<UiKitTextFieldProps>;
export declare const InputLabelConfig: InputLabelProps;
