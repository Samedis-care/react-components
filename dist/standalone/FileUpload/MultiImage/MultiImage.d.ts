import React from "react";
import { ImageBoxProps } from "./ImageBox";
import { GroupBoxHTMLProps } from "../../GroupBox";
import { IDownscaleProps } from "../../../utils/processImage";
import { ImageDialogEntryProps } from "./ImageDialogEntry";
import { ImageErrorHandler } from "../useImageError";
export interface MultiImageImage {
    /**
     * A unique identifier for the image
     */
    id: string;
    /**
     * The image: its URL (or data URI), or the image the user picked
     */
    image: string | Blob;
    /**
     * The file name of the image
     */
    name: string;
    /**
     * Is the image readonly? Disables delete and replace functionality
     */
    readOnly?: boolean;
}
export type MultiImageManipulationCallback = (images: MultiImageImage[]) => MultiImageImage[];
export type MultiImageProcessFile = (file: File) => Promise<File>;
export interface MultiImageProps {
    /**
     * The label of the control
     */
    label: React.ReactNode;
    /**
     * The name of this field
     */
    name?: string;
    /**
     * Fixed preview size
     * @default 256
     */
    previewSize?: number;
    /**
     * Upload image
     * Shown to in edit dialog
     */
    uploadImage: string;
    /**
     * Capture image
     * Shown to in edit dialog
     */
    captureImage: string;
    /**
     * Placeholder image
     * Shown in normal on page control if no image present.
     * Defaults to uploadImage if not set
     */
    placeholderImage?: string;
    /**
     * The current images
     * The first image is considered "primary" unless primary is set
     */
    images: MultiImageImage[];
    /**
     * The primary image ID
     */
    primary: string | null;
    /**
     * Change event
     * @param name The name of this field
     * @param newImages The new images
     */
    onChange?: (name: string | undefined, newImages: MultiImageImage[]) => void;
    /**
     * Change event for primary image id
     * @param name The name of this field
     * @param primary The new primary image ID or null if no image is present
     */
    onPrimaryChange?: (name: string | undefined, primary: string | null) => void;
    /**
     * Callback for delete confirmation
     * @param image The image that the user wants to delete
     * @returns Should the delete commence?
     */
    onDelete?: (image: MultiImageImage) => Promise<boolean> | boolean;
    /**
     * Called if one of the selected images couldn't be processed (e.g. an image format the browser
     * can't decode, like HEIC). If unset an error dialog is shown instead.
     */
    onError?: ImageErrorHandler;
    /**
     * Custom edit label
     */
    editLabel?: React.ReactNode;
    /**
     * The max amount of images
     */
    maxImages?: number;
    /**
     * Allow capture?
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/capture
     */
    capture?: false | "user" | "environment";
    /**
     * Is the control read-only?
     */
    readOnly?: boolean;
    /**
     * Is the field busy, e.g. writing its changes?
     * @remarks Sets `aria-busy` on the field. While it is false, the `aria-busy` of
     *          `slotProps.groupBox` applies.
     * @default false
     */
    busy?: boolean;
    /**
     * Props for the parts of the control
     */
    slotProps?: {
        /**
         * HTML attributes for the field's frame (`GroupBox`), e.g. `aria-describedby` for an
         * error shown next to it
         */
        groupBox?: GroupBoxHTMLProps;
    };
    /**
     * MimeType to convert the image to (e.g. image/png or image/jpg)
     */
    convertImagesTo?: string;
    /**
     * Settings to downscale an image
     */
    downscale?: IDownscaleProps;
    /**
     * Hide the rotate buttons of the full-screen previews
     */
    disableRotation?: boolean;
    /**
     * Additional dialog content (e.g. how-to-box)
     */
    additionalDialogContent?: React.ReactNode[];
    /**
     * Shown at the top of the edit dialog while that is open, e.g. the outcome of a change
     * made in it: the modal dialog hides the rest of the page from assistive technology
     * @remarks Memoize it, or every render of the owner renders MultiImage again.
     */
    dialogMessage?: React.ReactNode;
    /**
     * Called when the edit dialog opens, and when it closes: by the user, because the
     * control became read-only, or because the control unmounts
     * @param open Whether the dialog is open now
     */
    onDialogOpenChange?: (open: boolean) => void;
    /**
     * custom CSS class to apply to root
     */
    className?: string;
    /**
     * Custom CSS styles
     */
    classes?: Partial<Record<MultiImageClassKey, string>>;
    /**
     * Custom CSS styles (sub-components)
     */
    subClasses?: {
        imageBox?: ImageBoxProps["classes"];
        imageDialogEntry?: ImageDialogEntryProps["classes"];
        imageDialogEntrySubClasses?: ImageDialogEntryProps["subClasses"];
    };
}
export type MultiImageClassKey = "root" | "uploadInput" | "rootContainer" | "imageItem" | "editLabel";
export declare const MultiImageNewIdPrefix = "MultiImage-New-";
declare const _default: React.MemoExoticComponent<(inProps: MultiImageProps) => React.JSX.Element>;
export default _default;
