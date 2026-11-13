import React, { useCallback, useContext, useMemo, useReducer } from "react";
import { initialToastState, ToastConfig, toastReducer } from "./toastReducer";
import ToastOutlet, {
	ToastOutletContext,
	ToastOutletContextType,
} from "./ToastOutlet";

export type { ToastConfig } from "./toastReducer";

export type ToastContextType = [
	showToast: (toast: ToastConfig) => void,
	closeToast: () => void,
];

/**
 * Context for non-blocking notices (toasts)
 */
export const ToastContext = React.createContext<ToastContextType | undefined>(
	undefined,
);

/**
 * Returns `[showToast, closeToast]` of the nearest ToastContextProvider (part of
 * Framework). A toast's title and message render where that provider renders
 * its toasts, not where showToast was called: in the Framework inside its
 * providers (the DialogContext included), but outside the providers the app
 * puts inside the Framework, so they cannot use those
 * @throws Error when there is no ToastContextProvider around the calling component
 */
export const useToastContext = (): ToastContextType => {
	const ctx = useContext(ToastContext);
	if (!ctx)
		throw new Error(
			"ToastContext is missing, did you forget to add Components-Care Framework or ToastContextProvider?",
		);
	return ctx;
};

export interface ToastContextProviderProps {
	/**
	 * The part of the app that can show toasts (useToastContext)
	 */
	children: React.ReactNode;
	/**
	 * Leave rendering the toasts to a ToastOutlet among the children instead of
	 * rendering them after the children. The toasts' content can then use the
	 * contexts provided between this provider and the outlet, while everything
	 * among the children can still show toasts. Without a ToastOutlet no toast
	 * is shown. The Framework sets it and renders the outlet inside its
	 * DialogContextProvider
	 * @default false
	 */
	disableDefaultOutlet?: boolean;
}

const defaultOutlet = <ToastOutlet />;

/**
 * Provides the application with non-blocking notices (toasts), one at a time.
 * A new toast replaces the one currently shown. The toasts render after the
 * children (or at a ToastOutlet, see disableDefaultOutlet), inside this
 * provider: their title and message can use the contexts provided around it
 * (or the outlet), not those around the component that showed them. An error
 * thrown while rendering a toast drops the toast and is reported
 * (configureErrorReporting, source "ToastOutlet"), the app stays
 */
const ToastContextProvider = (props: ToastContextProviderProps) => {
	const { children, disableDefaultOutlet } = props;
	const [state, dispatch] = useReducer(toastReducer, initialToastState);

	const showToast = useCallback(
		(toast: ToastConfig) => dispatch({ type: "show", toast }),
		[],
	);
	const closeToast = useCallback(() => dispatch({ type: "close" }), []);
	const handleExited = useCallback(() => dispatch({ type: "exited" }), []);

	const toastActions: ToastContextType = useMemo(
		() => [showToast, closeToast],
		[showToast, closeToast],
	);

	const outlet: ToastOutletContextType = useMemo(
		() => ({ state, close: closeToast, exited: handleExited }),
		[state, closeToast, handleExited],
	);

	return (
		<ToastContext.Provider value={toastActions}>
			{/* null: an outlet among the children must not render these toasts twice */}
			<ToastOutletContext.Provider value={disableDefaultOutlet ? outlet : null}>
				{children}
			</ToastOutletContext.Provider>
			{!disableDefaultOutlet && (
				<ToastOutletContext.Provider value={outlet}>
					{defaultOutlet}
				</ToastOutletContext.Provider>
			)}
		</ToastContext.Provider>
	);
};

export default React.memo(ToastContextProvider);
