import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useContext, useMemo, useReducer } from "react";
import { Toast } from "../standalone/Toast";
import { initialToastState, toastReducer } from "./toastReducer";
/**
 * Context for non-blocking notices (toasts)
 */
export const ToastContext = React.createContext(undefined);
export const useToastContext = () => {
    const ctx = useContext(ToastContext);
    if (!ctx)
        throw new Error("ToastContext is missing, did you forget to add Components-Care Framework or ToastContextProvider?");
    return ctx;
};
/**
 * Provides the application with non-blocking notices (toasts), one at a time.
 * A new toast replaces the one currently shown
 */
const ToastContextProvider = (props) => {
    const [state, dispatch] = useReducer(toastReducer, initialToastState);
    const showToast = useCallback((toast) => dispatch({ type: "show", toast }), []);
    const closeToast = useCallback(() => dispatch({ type: "close" }), []);
    const handleExited = useCallback(() => dispatch({ type: "exited" }), []);
    const toastActions = useMemo(() => [showToast, closeToast], [showToast, closeToast]);
    return (_jsxs(ToastContext.Provider, { value: toastActions, children: [props.children, state.current && (_jsx(Toast, { open: state.open, severity: state.current.severity, title: state.current.title, message: state.current.message, autoHideDuration: state.current.autoHideDuration, anchorOrigin: state.current.anchorOrigin, onClose: closeToast, onExited: handleExited }))] }));
};
export default React.memo(ToastContextProvider);
