import React from "react";
import { captureError } from "./ErrorReporting";

export interface ToastErrorBoundaryProps {
	/**
	 * The toast
	 */
	children: React.ReactNode;
	/**
	 * Called once the error was reported: removes the failed toast (shows the
	 * waiting one, if any)
	 */
	onError: () => void;
	/**
	 * A new value renders the children again after an error: the toast state,
	 * which onError replaces
	 */
	resetKey: unknown;
}

interface ToastErrorBoundaryState {
	/**
	 * Did rendering the children throw (since resetKey changed)?
	 */
	failed: boolean;
	/**
	 * The resetKey of the last render
	 */
	resetKey: unknown;
}

/**
 * Keeps an error thrown while rendering a toast (e.g. by a component in its
 * message) from unmounting the app: the toast is not rendered, the error is
 * reported (captureError, source "ToastOutlet") and onError is called
 */
class ToastErrorBoundary extends React.Component<
	ToastErrorBoundaryProps,
	ToastErrorBoundaryState
> {
	state: ToastErrorBoundaryState = {
		failed: false,
		resetKey: this.props.resetKey,
	};

	static getDerivedStateFromError(): Partial<ToastErrorBoundaryState> {
		return { failed: true };
	}

	static getDerivedStateFromProps(
		props: ToastErrorBoundaryProps,
		state: ToastErrorBoundaryState,
	): Partial<ToastErrorBoundaryState> | null {
		if (props.resetKey === state.resetKey) return null;
		return { failed: false, resetKey: props.resetKey };
	}

	componentDidCatch(error: unknown) {
		captureError(error, { source: "ToastOutlet" });
		this.props.onError();
	}

	render() {
		return this.state.failed ? null : this.props.children;
	}
}

export default ToastErrorBoundary;
