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
     * The message. Shown through the ToastContext, the title and message
     * render where the ToastContextProvider renders its toasts, not where
     * showToast was called (see useToastContext)
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
     * @remarks `filled` is MUI's filled Alert: MUI's text color
     * (`palette.getContrastText(palette[severity].main)`) on MUI's fill
     * (`palette[severity].main`, in a dark palette `.dark`). Where that text has
     * less than the 4.5:1 that text needs, the toast darkens the fill (behind
     * dark text: lightens it) just enough, keeping its hue; with MUI's default
     * light palette that is info and warning. A custom palette needs nothing
     * more: only a color the toast cannot measure (a CSS variable, a keyword) is
     * used as it is, and must then reach 4.5:1 with its contrast text itself.
     * `standard` and `outlined` keep MUI's colors.
     */
    variant?: AlertProps["variant"];
    /**
     * Called when the toast times out or the user closes it (close button, or
     * Escape while the toast has focus)
     */
    onClose: () => void;
    /**
     * Called when the close transition has finished: the moment to unmount the
     * toast or clear its content. A toast rendered closed without having been
     * in the page (e.g. closed in the update that opened it) has no close
     * transition and calls it right after that render, once. Optional: the
     * closed toast leaves the page after its close transition with or without it
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
