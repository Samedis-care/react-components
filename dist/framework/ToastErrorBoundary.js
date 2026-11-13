import React from "react";
import { captureError } from "./ErrorReporting";
/**
 * Keeps an error thrown while rendering a toast (e.g. by a component in its
 * message) from unmounting the app: the toast is not rendered, the error is
 * reported (captureError, source "ToastOutlet") and onError is called
 */
class ToastErrorBoundary extends React.Component {
    state = {
        failed: false,
        resetKey: this.props.resetKey,
    };
    static getDerivedStateFromError() {
        return { failed: true };
    }
    static getDerivedStateFromProps(props, state) {
        if (props.resetKey === state.resetKey)
            return null;
        return { failed: false, resetKey: props.resetKey };
    }
    componentDidCatch(error) {
        captureError(error, { source: "ToastOutlet" });
        this.props.onError();
    }
    render() {
        return this.state.failed ? null : this.props.children;
    }
}
export default ToastErrorBoundary;
