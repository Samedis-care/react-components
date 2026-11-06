import React, { CSSProperties } from "react";
import { UseDropZoneParams } from "../../../utils/useDropZone";
import { ImageDotsProps } from "./ImageDots";
export interface ImageBoxProps {
    /**
     * The Image to display: its URL (or data URI), or an image the user picked
     */
    image: string | Blob;
    /**
     * The image file name
     */
    fileName?: string | null;
    /**
     * The width of the preview
     */
    width?: CSSProperties["width"];
    /**
     * The height of the preview
     */
    height?: CSSProperties["height"];
    /**
     * The custom onClick handler.
     * If not set, the image is a button named after fileName ("Open photo.jpg in full
     * screen") that opens a fullscreen preview by click, Enter or Space; focus returns to it
     * when the preview closes
     * If set the onClick handler will be called when the box is clicked, and there is no
     * button and no fullscreen preview
     * If set to null explicitly no action will be performed and the cursor won't show clickable
     */
    onClick?: React.MouseEventHandler | null;
    /**
     * File drop handler
     */
    onFilesDropped?: UseDropZoneParams;
    /**
     * Goto next image. Optional, will show next arrow if set. On the box the arrow shows
     * while the box is hovered or holds the focus, and always on devices that cannot
     * hover; in the fullscreen preview always.
     */
    onNextImage?: () => void;
    /**
     * Goto prev image. Optional, will show go back arrow if set. On the box the arrow shows
     * while the box is hovered or holds the focus, and always on devices that cannot
     * hover; in the fullscreen preview always.
     */
    onPrevImage?: () => void;
    /**
     * Disable background color?
     */
    disableBackground?: boolean;
    /**
     * Hide the rotate buttons of the full-screen preview
     */
    disableRotation?: boolean;
    /**
     * Custom CSS styles to apply to root
     */
    className?: string;
    /**
     * Custom CSS styles. openButton is the button around the image that opens the
     * fullscreen preview (only rendered while onClick is not set).
     */
    classes?: Partial<Record<ImageBoxClassKey, string>>;
    /**
     * Image dots props (set to enable image props)
     */
    imageDots?: ImageDotsProps;
}
export interface ImageBoxRootOwnerState {
    background: boolean;
    dragging: boolean;
    clickable: boolean;
}
export interface ImageBoxStyledImageOwnerState {
    swipeLeft: boolean;
    swipeRight: boolean;
    imageDots: boolean;
}
export type ImageBoxClassKey = "root" | "removeBtn" | "prevBtn" | "nextBtn" | "openButton" | "fullScreenRotateButtons" | "rotateLeftBtn" | "rotateRightBtn" | "swipeListener" | "image" | "fullScreenDialog" | "fullScreenImageWrapper" | "fullScreenZoomContainer" | "imageDotsWrapper" | "imageDots";
declare const _default: React.MemoExoticComponent<(inProps: ImageBoxProps) => React.JSX.Element>;
export default _default;
