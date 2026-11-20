import React, { Suspense, useContext, useMemo } from "react";
import { Toast } from "../standalone/Toast";
import type { ToastState } from "./toastReducer";
import ToastErrorBoundary from "./ToastErrorBoundary";

/**
 * The toasts of a ToastContextProvider, for the ToastOutlet that renders them
 */
export interface ToastOutletContextType {
	/**
	 * The toast shown or closing, and the one waiting
	 */
	state: ToastState;
	/**
	 * Closes the current toast
	 */
	close: () => void;
	/**
	 * The current toast has left the page: shows the waiting one
	 */
	exited: () => void;
}

/**
 * Set by a ToastContextProvider: around its children with disableDefaultOutlet,
 * else around its own ToastOutlet only (and null around its children)
 */
export const ToastOutletContext =
	React.createContext<ToastOutletContextType | null>(null);

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
 *
 * A title or message that suspends (e.g. a React.lazy component in it) does not
 * reach the app's Suspense either: the toast shows right away, and that title
 * or message stays empty until it has loaded. A toast still loading closes and
 * gives way to the next one like any other.
 */
const ToastOutlet = () => {
	const outlet = useContext(ToastOutletContext);
	const toast = outlet?.state.current;
	const title = toast?.title;
	const message = toast?.message;
	// around the content only, not the whole Toast: a Toast suspended before it
	// opened does not call onExited when it is closed meanwhile, and every
	// later toast waits for that. A falsy title is passed on as it is
	const suspensefulTitle = useMemo(
		() => (title ? <Suspense>{title}</Suspense> : title),
		[title],
	);
	const suspensefulMessage = useMemo(
		() => <Suspense>{message}</Suspense>,
		[message],
	);
	if (!outlet || !toast) return null;
	return (
		<ToastErrorBoundary onError={outlet.exited} resetKey={outlet.state}>
			<Toast
				open={outlet.state.open}
				severity={toast.severity}
				title={suspensefulTitle}
				message={suspensefulMessage}
				autoHideDuration={toast.autoHideDuration}
				anchorOrigin={toast.anchorOrigin}
				onClose={outlet.close}
				onExited={outlet.exited}
			/>
		</ToastErrorBoundary>
	);
};

export default React.memo(ToastOutlet);
