import React, { CSSProperties } from "react";
import { UseDropZoneParams } from "../../../utils/useDropZone";
import { ImageDotsProps } from "./ImageDots";
export interface ImageBoxProps {
    /**
     * The Image to display (URL/Data-URI)
     */
    image: string;
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
     * If not set a fullscreen preview will be opened
     * If set the onClick handler will be called
     * If set to null explicitly no action will be performed and the cursor won't show clickable
     */
    onClick?: React.MouseEventHandler | null;
    /**
     * File drop handler
     */
    onFilesDropped?: UseDropZoneParams;
    /**
     * Remove handler. Optional, will show remove icon if set
     */
    onRemove?: () => void;
    /**
     * Goto next image. Optional, will show next arrow if set
     */
    onNextImage?: () => void;
    /**
     * Goto prev image. Optional, will show go back arrow if set
     */
    onPrevImage?: () => void;
    /**
     * Disable background color?
     */
    disableBackground?: boolean;
    /**
     * Custom CSS styles to apply to root
     */
    className?: string;
    /**
     * Custom CSS styles
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
export type ImageBoxClassKey = "root" | "removeBtn" | "prevBtn" | "nextBtn" | "swipeListener" | "image" | "fullScreenDialog" | "fullScreenImageWrapper" | "imageDotsWrapper" | "imageDots";
declare const _default: React.MemoExoticComponent<(inProps: ImageBoxProps) => React.JSX.Element>;
export default _default;
