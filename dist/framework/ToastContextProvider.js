import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useContext, useMemo, useReducer } from "react";
import { initialToastState, toastReducer } from "./toastReducer";
import ToastOutlet, { ToastOutletContext, } from "./ToastOutlet";
/**
 * Context for non-blocking notices (toasts)
 */
export const ToastContext = React.createContext(undefined);
/**
 * Returns `[showToast, closeToast]` of the nearest ToastContextProvider (part of
 * Framework). A toast's title and message render where that provider renders
 * its toasts, not where showToast was called: in the Framework inside its
 * providers (the DialogContext included), but outside the providers the app
 * puts inside the Framework, so they cannot use those
 * @throws Error when there is no ToastContextProvider around the calling component
 */
export const useToastContext = () => {
    const ctx = useContext(ToastContext);
    if (!ctx)
        throw new Error("ToastContext is missing, did you forget to add Components-Care Framework or ToastContextProvider?");
    return ctx;
};
const defaultOutlet = _jsx(ToastOutlet, {});
/**
 * Provides the application with non-blocking notices (toasts), one at a time.
 * A new toast replaces the one currently shown. The toasts render after the
 * children (or at a ToastOutlet, see disableDefaultOutlet), inside this
 * provider: their title and message can use the contexts provided around it
 * (or the outlet), not those around the component that showed them. An error
 * thrown while rendering a toast drops the toast and is reported
 * (configureErrorReporting, source "ToastOutlet"), the app stays
 */
const ToastContextProvider = (props) => {
    const { children, disableDefaultOutlet } = props;
    const [state, dispatch] = useReducer(toastReducer, initialToastState);
    const showToast = useCallback((toast) => dispatch({ type: "show", toast }), []);
    const closeToast = useCallback(() => dispatch({ type: "close" }), []);
    const handleExited = useCallback(() => dispatch({ type: "exited" }), []);
    const toastActions = useMemo(() => [showToast, closeToast], [showToast, closeToast]);
    const outlet = useMemo(() => ({ state, close: closeToast, exited: handleExited }), [state, closeToast, handleExited]);
    return (_jsxs(ToastContext.Provider, { value: toastActions, children: [_jsx(ToastOutletContext.Provider, { value: disableDefaultOutlet ? outlet : null, children: children }), !disableDefaultOutlet && (_jsx(ToastOutletContext.Provider, { value: outlet, children: defaultOutlet }))] }));
};
export default React.memo(ToastContextProvider);
