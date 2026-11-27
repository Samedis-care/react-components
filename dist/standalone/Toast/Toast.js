import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Alert, alertClasses, AlertTitle, buttonBaseClasses, Portal, Snackbar, styled, useMediaQuery, useTheme, useThemeProps, } from "@mui/material";
import combineClassNames from "../../utils/combineClassNames";
import focusRing from "../../utils/internal/focusRing";
import readableFill from "../../utils/internal/readableFill";
import useLiveRegionText from "../../utils/internal/useLiveRegionText";
import useCCTranslations from "../../utils/useCCTranslations";
const DEFAULT_AUTO_HIDE_DURATIONS = {
    success: 4000,
    info: 4000,
    warning: 6000,
    error: 6000,
};
const DEFAULT_ANCHOR_ORIGIN = {
    vertical: "bottom",
    horizontal: "right",
};
const COLOR_CLASSES = {
    success: alertClasses.colorSuccess,
    info: alertClasses.colorInfo,
    warning: alertClasses.colorWarning,
    error: alertClasses.colorError,
};
/**
 * The fills of the filled variant that differ from MUI's: for each severity
 * whose text has less than 4.5:1 on MUI's fill, that fill moved away from the
 * text just enough (MUI's own aims at 3:1). The text color stays MUI's.
 * @param theme The theme
 * @returns The rules for the alert slot
 */
const readableFilledFills = (theme) => {
    const rules = {};
    for (const [severity, colorClass] of Object.entries(COLOR_CLASSES)) {
        const color = theme.palette[severity];
        const fill = theme.palette.mode === "dark" ? color.dark : color.main;
        const readable = readableFill(fill, theme.palette.getContrastText(color.main));
        if (readable !== fill) {
            rules[`&.${alertClasses.filled}.${colorClass}`] = {
                backgroundColor: readable,
            };
        }
    }
    // with CSS theme variables, only in the color scheme theme.palette
    // describes; other schemes keep MUI's fills
    return theme.applyStyles(theme.palette.mode, rules);
};
const Root = styled(Snackbar, { name: "CcToast", slot: "root" })({});
const ToastAlert = styled(Alert, { name: "CcToast", slot: "alert" })(({ theme }) => ({
    flexGrow: 1,
    // below sm the toast spans the screen: content that cannot wrap (an
    // image, preformatted text) scrolls inside the message, as on wider
    // screens, instead of pushing the toast past the screen's edge
    minWidth: 0,
    [theme.breakpoints.up("sm")]: {
        flexGrow: "initial",
        minWidth: 288,
        maxWidth: 560,
    },
    // a word too long for a line (a German compound, a URL, an id in a
    // server error) breaks where it has to instead of making the message
    // scroll sideways. "break-word" would not lower the toast's minimum
    // width, which on a phone pushed it past the screen's left edge
    [`& .${alertClasses.message}`]: {
        overflowWrap: "anywhere",
    },
    // the keyboard-focused close button: MUI shows only its focus ripple,
    // faint and gone in forced colors. The ring takes the toast's text
    // color, which contrasts with every fill, where the primary color may not
    [`& .${alertClasses.action} .${buttonBaseClasses.focusVisible}`]: focusRing(theme, 2, "currentColor"),
    ...readableFilledFills(theme),
}));
const ToastRaw = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcToast" });
    const { open, severity = "info", title, message, autoHideDuration, autoHideDurations, anchorOrigin = DEFAULT_ANCHOR_ORIGIN, phoneVertical = "top", variant = "filled", onClose, onExited, className, classes, } = props;
    const { t } = useCCTranslations();
    const theme = useTheme();
    const role = severity === "error" || severity === "warning" ? "alert" : "status";
    // the alert element is the live region: the title and message go into it a
    // frame after it is in the page (and after each opening and role change),
    // so screen readers announce them
    const [regionRef, textShown] = useLiveRegionText(open, role);
    // below sm MUI's Snackbar spans the screen's width: there only the
    // vertical position counts, and it is phoneVertical's
    const phone = useMediaQuery(theme.breakpoints.down("sm"));
    const placement = useMemo(() => phone && anchorOrigin.vertical !== phoneVertical
        ? { vertical: phoneVertical, horizontal: anchorOrigin.horizontal }
        : anchorOrigin, [phone, anchorOrigin, phoneVertical]);
    const duration = autoHideDuration !== undefined
        ? autoHideDuration
        : autoHideDurations?.[severity] !== undefined
            ? autoHideDurations[severity]
            : DEFAULT_AUTO_HIDE_DURATIONS[severity];
    const handleSnackbarClose = useCallback((_evt, reason) => {
        // a click elsewhere belongs to the page. Escape anywhere closes the
        // toast, as MUI's Snackbar does: its document listener skips an
        // Escape whose default was prevented, and a dialog or menu stops
        // the Escape that closes it before it gets there
        if (reason === "clickaway")
            return;
        onClose();
    }, [onClose]);
    const handleKeyDown = useCallback((evt) => {
        if (evt.key !== "Escape")
            return;
        // handled: the Snackbar's document listener skips it, so onClose is
        // called once
        evt.preventDefault();
        onClose();
    }, [onClose]);
    const onExitedRef = useRef(onExited);
    onExitedRef.current = onExited;
    // the toast has been in the page (its close transition calls onExited), or
    // has called onExited without one
    const exitHandledRef = useRef(false);
    const handleEnter = useCallback(() => {
        exitHandledRef.current = true;
    }, []);
    const handleExited = useCallback(() => {
        onExitedRef.current?.();
    }, []);
    // rendered closed without having been in the page (e.g. closed in the
    // update that opened it), the Snackbar renders nothing and runs no close
    // transition: the toast has exited already. Once, also when StrictMode runs
    // the effect twice
    useEffect(() => {
        if (open || exitHandledRef.current)
            return;
        exitHandledRef.current = true;
        onExitedRef.current?.();
    }, [open]);
    // both handlers are functions: an onExited key, even undefined, replaces
    // the Snackbar's own exit handler, so the closed toast would stay in the page
    const slotProps = useMemo(() => ({ transition: { onEnter: handleEnter, onExited: handleExited } }), [handleEnter, handleExited]);
    return (_jsx(Portal, { children: _jsx(Root, { open: open, autoHideDuration: duration, anchorOrigin: placement, onClose: handleSnackbarClose, slotProps: slotProps, className: combineClassNames([className, classes?.root]), children: _jsxs(ToastAlert, { ref: regionRef, severity: severity, variant: variant, role: role, closeText: t("standalone.toast.close"), onClose: onClose, onKeyDown: handleKeyDown, className: classes?.alert, children: [textShown && title && _jsx(AlertTitle, { children: title }), textShown && message] }) }) }));
};
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
export const Toast = React.memo(ToastRaw);
