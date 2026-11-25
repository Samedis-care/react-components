import React from "react";
export interface ImagePreviewDialogProps {
    /**
     * The image source (data URI or URL)
     */
    src: string;
    /**
     * Alt text for the image
     * @remarks Also the dialog's accessible name (the dialog is labelled by the image), so a
     *          screen reader announces it when the dialog opens. Should not be empty.
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
     * Hide the rotate buttons
     */
    disableRotation?: boolean;
    /**
     * Custom styles. `toolbar` holds the rotate buttons (`rotateButtons`) and the zoom
     * buttons (`zoomButtons`) in the top left corner. While the image is zoomed in,
     * `container` also carries the class `CcImagePreviewDialog-zoomed` (and shows the grab
     * cursor).
     */
    classes?: Partial<Record<ImagePreviewDialogClassKey, string>>;
}
export type ImagePreviewDialogClassKey = "root" | "closeButton" | "toolbar" | "rotateButtons" | "rotateLeftButton" | "rotateRightButton" | "zoomButtons" | "zoomInButton" | "zoomOutButton" | "resetZoomButton" | "container" | "image";
declare const _default: React.MemoExoticComponent<(inProps: ImagePreviewDialogProps) => React.JSX.Element>;
export default _default;
