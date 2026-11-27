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
     * Optional bold title above the message. Like the message, it is rendered a
     * frame after the toast opens (see Toast)
     */
    title?: React.ReactNode;
    /**
     * The message. Its text and the title wrap within the toast; a word too
     * long for a line (a URL, an id) breaks where it has to, so the toast stays
     * within the screen. Shown through the ToastContext, the title and message
     * render where the ToastContextProvider renders its toasts, not where
     * showToast was called (see useToastContext). It is rendered a frame after
     * the toast opens, and rendered anew (its components mount again) each time
     * the toast opens and when a new severity switches its role (see Toast)
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
     * Where the toast is shown from the sm breakpoint up, e.g. at the top where
     * the bottom of the screen holds controls the toast must not cover. Below
     * sm the toast spans the screen's width and phoneVertical sets whether it
     * is at the top or the bottom
     * @default { vertical: "bottom", horizontal: "right" }
     * @remarks The theme's default props set it app-wide, this per toast
     */
    anchorOrigin?: SnackbarOrigin;
    /**
     * Where the toast is shown below the sm breakpoint (phones, and wider
     * windows zoomed in), where it spans the screen's width: at the top or at
     * the bottom edge. At the top it keeps clear of the action bars and dialog
     * buttons at the bottom of the screen, which the full-width toast would
     * otherwise cover; it covers the top of the page (e.g. an app bar) instead
     * @default "top"
     * @remarks The theme's default props set it app-wide, this per toast
     */
    phoneVertical?: SnackbarOrigin["vertical"];
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
     * Called when the toast times out or the user closes it: with its close
     * button, or with Escape, wherever focus is, unless something else used
     * that Escape (an open dialog, menu or autocomplete closes instead, as
     * does anything that prevents the key's default). A click elsewhere does
     * not call it
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
/**
 * A short, non-blocking notice: a MUI Alert in a Snackbar, rendered in a portal
 * at the end of the page. Apps usually show it through useToastContext.
 *
 * Screen readers announce it: errors and warnings at once (role="alert"),
 * success and info when the user is idle (role="status"). They announce the
 * text written into such a live region after it is in the page, and often
 * skip a region that appears with its text already in it. So the toast's title
 * and message are written into it a frame after the toast is in the page (it is
 * still fading in), and written anew each time the toast opens and when a new
 * severity switches it between the two roles. A test that finds the toast by
 * its role waits for its text, e.g.
 * `await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Saved."))`.
 */
export declare const Toast: React.MemoExoticComponent<(inProps: ToastProps) => React.JSX.Element>;
