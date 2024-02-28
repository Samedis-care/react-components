import React from "react";
import { ButtonProps } from "@mui/material";
import { CSSProperties } from "@mui/styles";
export interface ActionButtonTheme {
    padding?: CSSProperties["padding"];
    border?: CSSProperties["border"];
    borderRadius?: CSSProperties["borderRadius"];
    backgroundColor?: CSSProperties["backgroundColor"];
    color?: CSSProperties["color"];
    fontSize?: CSSProperties["fontSize"];
    style?: CSSProperties;
    hover?: {
        border?: CSSProperties["border"];
        style?: CSSProperties;
    };
    disabled?: {
        backgroundColor?: CSSProperties["backgroundColor"];
        style?: CSSProperties;
    };
    label?: {
        style?: CSSProperties;
    };
}
export interface ActionButtonProps extends Omit<ButtonProps, "children"> {
    /**
     * The icon of the button
     */
    icon?: React.ReactNode;
    /**
     * Adjust full width of the button
     */
    fullWidth?: boolean;
    /**
     * Show the compact version of the button (only icon)
     */
    small?: boolean | "true";
    /**
     * The text of the button (used for tooltip if small is true)
     */
    children: React.ReactNode;
    /**
     * Custom colored buttons
     */
    textColor?: CSSProperties["color"];
    backgroundColor?: CSSProperties["backgroundColor"];
    borderColor?: CSSProperties["borderColor"];
}
declare const _default: React.MemoExoticComponent<(props: ActionButtonProps) => React.JSX.Element>;
export default _default;
