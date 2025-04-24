import React from "react";
import { ButtonProps } from "@mui/material";
export type ActionButtonClassKey = "button";
export interface ActionButtonOwnerState {
    small: boolean;
    color: boolean;
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
}
declare const ActionButton: (inProps: ActionButtonProps) => React.JSX.Element;
declare const _default: typeof ActionButton;
export default _default;
