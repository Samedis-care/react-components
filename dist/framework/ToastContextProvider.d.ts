import React from "react";
import { ToastConfig } from "./toastReducer";
export type { ToastConfig } from "./toastReducer";
export type ToastContextType = [
    showToast: (toast: ToastConfig) => void,
    closeToast: () => void
];
/**
 * Context for non-blocking notices (toasts)
 */
export declare const ToastContext: React.Context<ToastContextType | undefined>;
/**
 * Returns `[showToast, closeToast]` of the nearest ToastContextProvider (part of
 * Framework). A toast's title and message render where that provider renders
 * its toasts, not where showToast was called: in the Framework inside its
 * providers (the DialogContext included), but outside the providers the app
 * puts inside the Framework, so they cannot use those
 * @throws Error when there is no ToastContextProvider around the calling component
 */
export declare const useToastContext: () => ToastContextType;
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
declare const _default: React.MemoExoticComponent<(props: ToastContextProviderProps) => React.JSX.Element>;
export default _default;
