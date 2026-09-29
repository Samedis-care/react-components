import React from "react";
import { AlertColor, AlertProps, SnackbarOrigin } from "@mui/material";
export interface ToastProps {
    /**
     * Is the toast shown?
     */
    open: boolean;
    /**
     * The severity, sets the color, the icon and how urgently screen readers
     * announce the toast (error and warning interrupt, success and info wait)
     * @default "info"
     */
    severity?: AlertColor;
    /**
     * Optional bold title above the message
     */
    title?: React.ReactNode;
    /**
     * The message
     */
    message: React.ReactNode;
    /**
     * Milliseconds until the toast closes by itself, null keeps it open until
     * the user closes it. Defaults to autoHideDurations[severity]
     */
    autoHideDuration?: number | null;
    /**
     * The default autoHideDuration per severity, for use in the theme.
     * Severities left out use 4 s (success, info) and 6 s (warning, error)
     */
    autoHideDurations?: Partial<Record<AlertColor, number | null>>;
    /**
     * Where the toast is shown, e.g. at the top where the bottom of the screen
     * holds controls the toast must not cover
     * @default { vertical: "bottom", horizontal: "right" }
     * @remarks The theme's default props set it app-wide, this per toast
     */
    anchorOrigin?: SnackbarOrigin;
    /**
     * The alert variant
     * @default "filled"
     */
    variant?: AlertProps["variant"];
    /**
     * Called when the toast times out or the user closes it (close button, or
     * Escape while the toast has focus)
     */
    onClose: () => void;
    /**
     * Called when the close transition has finished
     */
    onExited?: () => void;
    /**
     * CSS class to apply to the root
     */
    className?: string;
    /**
     * Custom CSS classes
     */
    classes?: Partial<Record<ToastClassKey, string>>;
}
export type ToastClassKey = "root" | "alert";
export declare const Toast: React.MemoExoticComponent<(inProps: ToastProps) => React.JSX.Element>;
