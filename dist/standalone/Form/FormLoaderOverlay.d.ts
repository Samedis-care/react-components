import React from "react";
export interface FormLoaderOverlayRootOwnerState {
    visible: boolean;
}
export type FormLoaderOverlayClassKey = "root" | "loader";
export interface FormLoaderOverlayProps {
    /**
     * should the overlay be shown? will trigger fade-in, set to isSubmitting
     */
    visible: boolean;
    /**
     * custom styles applied to root
     */
    className?: string;
}
declare const _default: React.MemoExoticComponent<(inProps: FormLoaderOverlayProps) => React.JSX.Element>;
export default _default;
