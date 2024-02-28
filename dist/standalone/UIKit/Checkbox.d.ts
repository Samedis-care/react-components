import React from "react";
import { CheckboxProps } from "@mui/material";
import { CSSProperties } from "@mui/styles";
export interface CheckboxTheme {
    padding?: CSSProperties["padding"];
    margin?: CSSProperties["margin"];
    border?: CSSProperties["border"];
    borderRadius?: CSSProperties["borderRadius"];
    backgroundColor?: CSSProperties["backgroundColor"];
    fontSize?: CSSProperties["fontSize"];
    style?: CSSProperties;
    small?: {
        fontSize?: CSSProperties["fontSize"];
        style?: CSSProperties;
    };
    hover?: {
        backgroundColor?: CSSProperties["backgroundColor"];
        border?: CSSProperties["border"];
        style?: CSSProperties;
    };
    disabled?: {
        box?: {
            color?: CSSProperties["color"];
            fill?: CSSProperties["fill"];
            style?: CSSProperties;
        };
        backgroundColor?: CSSProperties["backgroundColor"];
        style?: CSSProperties;
    };
    box?: {
        small?: {
            style?: CSSProperties;
        };
        borderWidth?: CSSProperties["borderWidth"];
        borderStyle?: CSSProperties["borderStyle"];
        borderColor?: CSSProperties["borderColor"];
        borderRadius?: CSSProperties["borderRadius"];
        color?: CSSProperties["color"];
        fill?: CSSProperties["fill"];
        backgroundColor?: CSSProperties["backgroundColor"];
        style?: CSSProperties;
    };
}
declare const _default: React.MemoExoticComponent<(props: CheckboxProps) => React.JSX.Element>;
export default _default;
