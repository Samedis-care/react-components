import React, { CSSProperties } from "react";
import { UseDropZoneParams } from "../../../utils/useDropZone";
import { Theme } from "@mui/material";
import { ClassNameMap, Styles } from "@mui/styles/withStyles";
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
     * Custom CSS styles
     */
    classes?: ClassNameMap<keyof ReturnType<typeof useStyles>>;
    /**
     * Image dots props (set to enable image props)
     */
    imageDots?: ImageDotsProps;
}
declare const useStyles: (props?: any) => ClassNameMap<"image" | "root" | "background" | "dragging" | "swipeListener" | "clickable" | "fullScreenImageWrapper" | "imageSwipeLeft" | "imageSwipeRight" | "imageSwipeNone" | "imageWithDots" | "removeBtn" | "prevBtn" | "nextBtn" | "imageDotsWrapper" | "imageDotsContainer">;
export type ImageBoxClassKey = keyof ReturnType<typeof useStyles>;
export type ImageBoxTheme = Partial<Styles<Theme, ImageBoxProps, ImageBoxClassKey>>;
declare const _default: React.MemoExoticComponent<(props: ImageBoxProps) => JSX.Element>;
export default _default;
