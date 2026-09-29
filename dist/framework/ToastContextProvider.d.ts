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
export declare const useToastContext: () => ToastContextType;
export interface ToastContextProviderProps {
    children: React.ReactNode;
}
declare const _default: React.MemoExoticComponent<(props: ToastContextProviderProps) => React.JSX.Element>;
export default _default;
