import React from "react";
export interface ImagePreviewDialogProps {
    /**
     * The image source (data URI or URL)
     */
    src: string;
    /**
     * Alt text for the image
     */
    alt: string;
    /**
     * Whether the dialog is open
     */
    open: boolean;
    /**
     * Called when the dialog should close
     */
    onClose: () => void;
    /**
     * Custom styles
     */
    classes?: Partial<Record<ImagePreviewDialogClassKey, string>>;
}
export type ImagePreviewDialogClassKey = "root" | "closeButton" | "container" | "image";
declare const _default: React.MemoExoticComponent<(inProps: ImagePreviewDialogProps) => import("react/jsx-runtime").JSX.Element>;
export default _default;
