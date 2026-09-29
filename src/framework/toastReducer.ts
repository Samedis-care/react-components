import type { ToastProps } from "../standalone/Toast";

/**
 * A toast as shown through the ToastContext
 */
export type ToastConfig = Pick<
	ToastProps,
	"severity" | "title" | "message" | "autoHideDuration"
>;

export interface ToastState {
	/**
	 * The toast that is shown or closing
	 */
	current: ToastConfig | null;
	/**
	 * Is current shown (false while it closes)?
	 */
	open: boolean;
	/**
	 * The toast to show once current has closed
	 */
	next: ToastConfig | null;
}

export type ToastAction =
	{ type: "show"; toast: ToastConfig } | { type: "close" } | { type: "exited" };

export const initialToastState: ToastState = {
	current: null,
	open: false,
	next: null,
};

/**
 * One toast at a time: a new toast closes the current one and is shown once
 * that has closed. Only the newest toast waits, older ones are dropped
 */
export const toastReducer = (
	state: ToastState,
	action: ToastAction,
): ToastState => {
	switch (action.type) {
		case "show":
			if (!state.current)
				return { current: action.toast, open: true, next: null };
			return { current: state.current, open: false, next: action.toast };
		case "close":
			if (!state.current) return state;
			return { current: state.current, open: false, next: null };
		case "exited":
			if (state.next) return { current: state.next, open: true, next: null };
			return initialToastState;
	}
};
