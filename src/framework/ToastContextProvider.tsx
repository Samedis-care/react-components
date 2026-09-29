import React, { useCallback, useContext, useMemo, useReducer } from "react";
import { Toast } from "../standalone/Toast";
import { initialToastState, ToastConfig, toastReducer } from "./toastReducer";

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

export const useToastContext = (): ToastContextType => {
	const ctx = useContext(ToastContext);
	if (!ctx)
		throw new Error(
			"ToastContext is missing, did you forget to add Components-Care Framework or ToastContextProvider?",
		);
	return ctx;
};

export interface ToastContextProviderProps {
	children: React.ReactNode;
}

/**
 * Provides the application with non-blocking notices (toasts), one at a time.
 * A new toast replaces the one currently shown
 */
const ToastContextProvider = (props: ToastContextProviderProps) => {
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

	return (
		<ToastContext.Provider value={toastActions}>
			{props.children}
			{state.current && (
				<Toast
					open={state.open}
					severity={state.current.severity}
					title={state.current.title}
					message={state.current.message}
					autoHideDuration={state.current.autoHideDuration}
					anchorOrigin={state.current.anchorOrigin}
					onClose={closeToast}
					onExited={handleExited}
				/>
			)}
		</ToastContext.Provider>
	);
};

export default React.memo(ToastContextProvider);
