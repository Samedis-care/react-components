import React from "react";
import { ButtonProps } from "@mui/material";
export interface SubActionButtonOwnerState {
    small: boolean;
    disableDivider: boolean;
}
export type SubActionButtonClassKey = "button";
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
declare const _default: React.MemoExoticComponent<(inProps: SubActionButtonProps) => React.JSX.Element>;
export default _default;
