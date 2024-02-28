import React from "react";
import { ButtonProps } from "@mui/material";
import { CSSProperties } from "@mui/styles";
export interface SubActionButtonTheme {
    width?: CSSProperties["width"];
    minWidth?: CSSProperties["minWidth"];
    padding?: CSSProperties["padding"];
    margin?: CSSProperties["margin"];
    border?: CSSProperties["border"];
    borderRadius?: CSSProperties["borderRadius"];
    backgroundColor?: CSSProperties["backgroundColor"];
    color?: CSSProperties["color"];
    style?: CSSProperties;
    firstChild?: {
        style?: CSSProperties;
    };
    lastChild?: {
        style?: CSSProperties;
    };
    icon?: {
        marginRight?: CSSProperties["marginRight"];
        color?: CSSProperties["color"];
        style?: CSSProperties;
    };
    hover?: {
        backgroundColor?: CSSProperties["backgroundColor"];
        color?: CSSProperties["color"];
        style?: CSSProperties;
        icon?: {
            color?: CSSProperties["color"];
            style?: CSSProperties;
        };
    };
    small?: {
        width?: CSSProperties["width"];
        minWidth?: CSSProperties["minWidth"];
        padding?: CSSProperties["padding"];
        margin?: CSSProperties["margin"];
        border?: CSSProperties["border"];
        borderRadius?: CSSProperties["borderRadius"];
        backgroundColor?: CSSProperties["backgroundColor"];
        color?: CSSProperties["color"];
        style?: CSSProperties;
        icon?: {
            color?: CSSProperties["color"];
            marginRight: CSSProperties["marginRight"];
            style?: CSSProperties;
        };
        hover?: {
            border?: CSSProperties["border"];
            borderRadius?: CSSProperties["borderRadius"];
            backgroundColor?: CSSProperties["backgroundColor"];
            color?: CSSProperties["color"];
            style?: CSSProperties;
            icon?: {
                color?: CSSProperties["color"];
                style?: CSSProperties;
            };
        };
        firstChild?: {
            style?: CSSProperties;
        };
        lastChild?: {
            style?: CSSProperties;
        };
        disabled?: {
            style?: CSSProperties;
            firstChild?: {
                style?: CSSProperties;
            };
            lastChild?: {
                style?: CSSProperties;
            };
        };
    };
    disabled?: {
        backgroundColor?: CSSProperties["backgroundColor"];
        border?: CSSProperties["border"];
        color?: CSSProperties["color"];
        style?: CSSProperties;
        icon?: {
            style?: CSSProperties;
        };
        firstChild?: {
            style?: CSSProperties;
        };
        lastChild?: {
            style?: CSSProperties;
        };
    };
    label?: {
        justifyContent?: CSSProperties["justifyContent"];
        style?: CSSProperties;
    };
}
export interface SubActionButtonProps extends Omit<ButtonProps, "children"> {
    /**
     * The icon of the button
     */
    icon?: React.ReactNode;
    /**
     * Show the compact version of the button (only icon)
     */
    small?: boolean;
    /**
     * The text of the button (used for tooltip if small is true)
     */
    children: NonNullable<React.ReactNode>;
    /**
     * Flag to disable the top divider
     */
    disableDivider?: boolean | "true";
}
declare const _default: React.MemoExoticComponent<(props: SubActionButtonProps) => React.JSX.Element>;
export default _default;
