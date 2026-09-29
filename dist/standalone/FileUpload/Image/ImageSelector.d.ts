import React from "react";
import { IDownscaleProps } from "../../../utils/processImage";
import { ImageErrorHandler } from "../useImageError";
/**
 * Edits an image the user picked, before it is processed
 * @param image The picked image
 * @returns The edited image (resolve to continue the change, reject to cancel it). A Blob
 *          that is not a File gets the picked file's name.
 */
export type PostImageEditCallback = (image: File) => Promise<Blob>;
export interface ImageSelectorProps {
    /**
     * The name of the input
     */
    name: string;
    /**
     * The current value of the input: the image's URL, or the image the user picked
     */
    value: string | Blob;
    /**
     * Allow capture?
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/capture
     */
    capture: false | "false" | "user" | "environment";
    /**
     * The label of the input
     */
    label?: string;
    /**
     * Does the value differ from the server-side value?
     * @remarks Marks the label. Set by the form engine from `RenderParams.dirty`.
     */
    dirty?: boolean;
    /**
     * The alt text of the image
     */
    alt: string;
    /**
     * The label type of the box
     */
    smallLabel?: boolean;
    /**
     * The change handler of the input
     * @param name The field name
     * @param value The selected image, processed (converted and down-scaled)
     */
    onChange?: (name: string, value: File) => void;
    /**
     * The blur event handler of the input
     */
    onBlur?: React.FocusEventHandler<HTMLElement>;
    /**
     * Label overwrite for Upload label
     */
    uploadLabel?: string;
    /**
     * Label overwrite for Upload label (capture button)
     */
    uploadLabelCapture?: string;
    /**
     * Label overwrite for Allowed file formats label
     * Modern variant only
     */
    formatsLabel?: string;
    /**
     * Is the control read-only?
     */
    readOnly: boolean;
    /**
     * MimeType to convert the image to (e.g. image/png or image/jpg)
     */
    convertImagesTo?: string;
    /**
     * Settings to downscale an image
     */
    downscale?: IDownscaleProps;
    /**
     * CSS class to apply to root
     */
    className?: string;
    /**
     * Custom styles
     */
    classes?: Partial<Record<ImageSelectorClassKey, string>>;
    /**
     * The display variant
     * @default normal (overridable by theme)
     */
    variant?: "normal" | "modern" | "profile_picture";
    /**
     * Hide the rotate buttons of the preview dialog
     * Modern variant only
     */
    disableRotation?: boolean;
    /**
     * Post upload image editing callback
     */
    postEditCallback?: PostImageEditCallback;
    /**
     * Called if the selected image couldn't be processed (e.g. an image format the browser can't
     * decode, like HEIC). If unset an error dialog is shown instead.
     */
    onError?: ImageErrorHandler;
}
export type ImageSelectorClassKey = "rootClassic" | "rootModern" | "imgWrapper" | "previewClassic" | "previewModern" | "changeEventHelper" | "modernUploadLabel" | "modernFullHeightBox" | "modernFullHeightGrid" | "modernFormatsLabel" | "modernFormatIcon" | "modernUploadControlsWrapper" | "modernUploadControlUpload" | "pfpRoot" | "pfpIconBtn" | "pfpImg" | "pfpImgPlaceholder";
declare const _default: React.MemoExoticComponent<(inProps: ImageSelectorProps) => React.JSX.Element>;
export default _default;
