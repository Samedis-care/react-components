import { jsx as _jsx } from "react/jsx-runtime";
import React, { useContext } from "react";
import { Toast } from "../standalone/Toast";
import ToastErrorBoundary from "./ToastErrorBoundary";
/**
 * Set by a ToastContextProvider: around its children with disableDefaultOutlet,
 * else around its own ToastOutlet only (and null around its children)
 */
export const ToastOutletContext = React.createContext(null);
/**
 * Renders the toasts of the ToastContextProvider around it, one at a time, when
 * that provider has disableDefaultOutlet. A toast's title and message render
 * here, so they can use every context provided around the outlet (the
 * Framework puts its outlet inside its DialogContextProvider). Render one
 * outlet per provider; inside a provider without disableDefaultOutlet it
 * renders nothing, that provider renders its toasts itself.
 *
 * An error thrown while rendering a toast (e.g. by a component in its message)
 * does not reach the app: the toast is dropped, the next one shows as usual,
 * and the error is reported (see configureErrorReporting, source
 * "ToastOutlet").
 */
const ToastOutlet = () => {
    const outlet = useContext(ToastOutletContext);
    const toast = outlet?.state.current;
    if (!outlet || !toast)
        return null;
    return (_jsx(ToastErrorBoundary, { onError: outlet.exited, resetKey: outlet.state, children: _jsx(Toast, { open: outlet.state.open, severity: toast.severity, title: toast.title, message: toast.message, autoHideDuration: toast.autoHideDuration, anchorOrigin: toast.anchorOrigin, onClose: outlet.close, onExited: outlet.exited }) }));
};
export default React.memo(ToastOutlet);
