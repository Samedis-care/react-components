import React from "react";
import type { ToastState } from "./toastReducer";
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
export declare const ToastOutletContext: React.Context<ToastOutletContextType | null>;
declare const _default: React.MemoExoticComponent<() => React.JSX.Element | null>;
export default _default;
