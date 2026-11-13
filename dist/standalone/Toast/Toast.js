import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Alert, alertClasses, AlertTitle, Portal, Snackbar, styled, useThemeProps, } from "@mui/material";
import combineClassNames from "../../utils/combineClassNames";
import readableFill from "../../utils/internal/readableFill";
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
    [theme.breakpoints.up("sm")]: {
        flexGrow: "initial",
        minWidth: 288,
        maxWidth: 560,
    },
    ...readableFilledFills(theme),
}));
const ToastRaw = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcToast" });
    const { open, severity = "info", title, message, autoHideDuration, autoHideDurations, anchorOrigin = DEFAULT_ANCHOR_ORIGIN, variant = "filled", onClose, onExited, className, classes, } = props;
    const { t } = useCCTranslations();
    const duration = autoHideDuration !== undefined
        ? autoHideDuration
        : autoHideDurations?.[severity] !== undefined
            ? autoHideDurations[severity]
            : DEFAULT_AUTO_HIDE_DURATIONS[severity];
    const handleSnackbarClose = useCallback((_evt, reason) => {
        // a click elsewhere or Escape outside the toast belong to the page
        if (reason !== "timeout")
            return;
        onClose();
    }, [onClose]);
    const handleKeyDown = useCallback((evt) => {
        if (evt.key === "Escape")
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
    return (_jsx(Portal, { children: _jsx(Root, { open: open, autoHideDuration: duration, anchorOrigin: anchorOrigin, onClose: handleSnackbarClose, slotProps: slotProps, className: combineClassNames([className, classes?.root]), children: _jsxs(ToastAlert, { severity: severity, variant: variant, role: severity === "error" || severity === "warning" ? "alert" : "status", closeText: t("standalone.toast.close"), onClose: onClose, onKeyDown: handleKeyDown, className: classes?.alert, children: [title && _jsx(AlertTitle, { children: title }), message] }) }) }));
};
export const Toast = React.memo(ToastRaw);
