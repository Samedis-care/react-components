import type { ToastProps } from "../standalone/Toast";
/**
 * A toast as shown through the ToastContext
 */
export type ToastConfig = Pick<ToastProps, "severity" | "title" | "message" | "autoHideDuration" | "anchorOrigin">;
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
export type ToastAction = {
    type: "show";
    toast: ToastConfig;
} | {
    type: "close";
} | {
    type: "exited";
};
export declare const initialToastState: ToastState;
/**
 * One toast at a time: a new toast closes the current one and is shown once
 * that has closed. Only the newest toast waits, older ones are dropped. A
 * current toast closed before it was in the page (two toasts in one update)
 * has closed at once: the Toast calls onExited right after rendering it closed
 */
export declare const toastReducer: (state: ToastState, action: ToastAction) => ToastState;
