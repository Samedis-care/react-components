import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useMemo } from "react";
import { Alert, AlertTitle, Portal, Snackbar, styled, useThemeProps, } from "@mui/material";
import combineClassNames from "../../utils/combineClassNames";
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
const Root = styled(Snackbar, { name: "CcToast", slot: "root" })({});
const ToastAlert = styled(Alert, { name: "CcToast", slot: "alert" })(({ theme }) => ({
    flexGrow: 1,
    [theme.breakpoints.up("sm")]: {
        flexGrow: "initial",
        minWidth: 288,
        maxWidth: 560,
    },
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
    const slotProps = useMemo(() => ({ transition: { onExited } }), [onExited]);
    return (_jsx(Portal, { children: _jsx(Root, { open: open, autoHideDuration: duration, anchorOrigin: anchorOrigin, onClose: handleSnackbarClose, slotProps: slotProps, className: combineClassNames([className, classes?.root]), children: _jsxs(ToastAlert, { severity: severity, variant: variant, role: severity === "error" || severity === "warning" ? "alert" : "status", closeText: t("standalone.toast.close"), onClose: onClose, onKeyDown: handleKeyDown, className: classes?.alert, children: [title && _jsx(AlertTitle, { children: title }), message] }) }) }));
};
export const Toast = React.memo(ToastRaw);
