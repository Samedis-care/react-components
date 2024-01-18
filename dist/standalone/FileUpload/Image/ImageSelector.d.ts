import React from "react";
import { IDownscaleProps } from "../../../utils/processImage";
export declare type PostImageEditCallback = (image: string) => Promise<string>;
export interface ImageSelectorProps {
    /**
     * The name of the input
     */
    name: string;
    /**
     * The current value of the input
     */
    value: string;
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
     * @param value The new value (data uri of selected image or empty string)
     */
    onChange?: (name: string, value: string) => void;
    /**
     * The blur event handler of the input
     */
    onBlur?: React.FocusEventHandler<HTMLElement>;
    /**
     * Label overwrite for Upload label
     */
    uploadLabel?: string;
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
     * Custom styles
     */
    classes?: Partial<ReturnType<typeof useStyles>>;
    /**
     * The display variant
     * @default normal (overridable by theme)
     */
    variant?: "normal" | "modern" | "profile_picture";
    /**
     * Post upload image editing callback
     * @param image The data uri image
     */
    postEditCallback?: PostImageEditCallback;
}
declare const useStyles: (props?: any) => import("@mui/styles").ClassNameMap<"root" | "preview" | "rootModern" | "imgWrapper" | "previewModern" | "modernUploadLabel" | "modernFormatsLabel" | "modernFormatIcon" | "modernFullHeight" | "clickablePreview" | "changeEventHelper" | "pfpRoot" | "pfpIconBtn" | "pfpImg">;
declare const _default: React.MemoExoticComponent<(props: ImageSelectorProps) => JSX.Element>;
export default _default;
