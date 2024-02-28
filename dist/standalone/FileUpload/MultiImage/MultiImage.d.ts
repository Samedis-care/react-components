import React from "react";
import { ImageBoxProps } from "./ImageBox";
import { Theme } from "@mui/material";
import { Styles } from "@mui/styles";
import { IDownscaleProps } from "../../../utils/processImage";
import { ImageDialogEntryProps } from "./ImageDialogEntry";
import { ClassNameMap } from "@mui/styles/withStyles";
export interface MultiImageImage {
    /**
     * A unique identifier for the image
     */
    id: string;
    /**
     * The URL/Data-URI of the image
     */
    image: string;
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
export type MultiImageProcessFile = (file: File) => Promise<string>;
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
     * MimeType to convert the image to (e.g. image/png or image/jpg)
     */
    convertImagesTo?: string;
    /**
     * Settings to downscale an image
     */
    downscale?: IDownscaleProps;
    /**
     * Additional dialog content (e.g. how-to-box)
     */
    additionalDialogContent?: React.ReactNode[];
    /**
     * Custom CSS styles
     */
    classes?: ClassNameMap<keyof ReturnType<typeof useStyles>>;
    /**
     * Custom CSS styles (sub-components)
     */
    subClasses?: {
        imageBox?: ImageBoxProps["classes"];
        imageDialogEntry?: ImageDialogEntryProps["classes"];
        imageDialogEntrySubClasses?: ImageDialogEntryProps["subClasses"];
    };
}
declare const useStyles: (props?: any) => ClassNameMap<"clickable" | "uploadInput" | "rootContainer" | "imageItem">;
export type MultiImageClassKey = keyof ReturnType<typeof useStyles>;
export type MultiImageTheme = Partial<Styles<Theme, MultiImageProps, MultiImageClassKey>>;
export declare const MultiImageNewIdPrefix = "MultiImage-New-";
declare const _default: React.MemoExoticComponent<(props: MultiImageProps) => React.JSX.Element>;
export default _default;
