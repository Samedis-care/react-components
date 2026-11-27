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
     * @remarks Set as `name` on the normal variant's buttons and on the button of the empty
     *          modern field, and as `data-name` on the modern variant's image area
     */
    name: string;
    /**
     * The current value of the input: the image's URL, or the image the user picked
     */
    value: string | Blob;
    /**
     * An image that stands in for the missing one while `value` is empty: its URL or data URI.
     * It is drawn where the picture would be (modern: framed, with the upload and camera
     * buttons in its corner; normal: below the buttons; profile_picture: in place of the person
     * icon), but it is not the field's image: its alt is empty, so assistive technology skips
     * it, and in modern a click on it opens the file dialog (read-only: nothing), never the
     * preview.
     * @default none: modern shows its call to action, normal an empty image area and
     *          profile_picture a person icon
     */
    placeholder?: string;
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
     * @remarks normal and modern: marks the frame with GroupBox's `dirty`, a dot after the
     *          label (after the asterisk of a required field) and "(modified)" in the
     *          frame's name. Set by the form engine from `RenderParams.dirty`.
     *          profile_picture shows no label and ignores it.
     */
    dirty?: boolean;
    /**
     * Is an image required?
     * @remarks normal and modern: marks the frame with GroupBox's `required`, an asterisk
     *          after the label and "Required" as the frame's description. Display only: it
     *          neither validates nor stops a change. Set by the form engine from
     *          `RenderParams.visibility.required`. profile_picture shows no label and
     *          ignores it.
     * @default false
     */
    required?: boolean;
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
     * @remarks normal: blur of the Upload and Take photo buttons. modern: blur of any element
     *          in the image area (the empty field's button, or the upload and camera buttons
     *          shown with an image or a placeholder).
     */
    onBlur?: React.FocusEventHandler<HTMLElement>;
    /**
     * Label overwrite for Upload label
     * @remarks normal: the Upload button's text. modern: the empty field's call to action,
     *          which is the text and accessible name of its button, and the tooltip of the
     *          shown image or placeholder.
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
export type ImageSelectorClassKey = "rootClassic" | "rootModern" | "imgWrapper" | "previewClassic" | "previewModern" | "changeEventHelper" | "modernUploadLabel" | "modernUploadButton" | "modernFullHeightBox" | "modernFullHeightGrid" | "modernFormatsLabel" | "modernFormatIcon" | "modernUploadControlsWrapper" | "modernUploadControlUpload" | "pfpRoot" | "pfpIconBtn" | "pfpImg" | "pfpImgPlaceholder";
declare const _default: React.MemoExoticComponent<(inProps: ImageSelectorProps) => React.JSX.Element>;
export default _default;
