import React from "react";
import { ImageBoxProps } from "./ImageBox";
import { MultiImageImage, MultiImageManipulationCallback, MultiImageProcessFile, MultiImageProps } from "./MultiImage";
import { ImageErrorReporter } from "../useImageError";
export interface ImageDialogEntryProps extends Pick<MultiImageProps, "previewSize" | "disableRotation"> {
    /**
     * The image
     */
    img: MultiImageImage;
    /**
     * Is the image set to primary
     */
    isPrimary: boolean;
    /**
     * Function to update images
     */
    changeImages: (cb: MultiImageManipulationCallback) => void;
    /**
     * Function to update primary image ID, called when the make-primary button of an image
     * that is not the primary one is activated
     * @param newId The new primary image ID
     */
    changePrimary: (newId: string) => void;
    /**
     * Process image file: decodes and converts the file that replaces the image, picked with
     * the Replace button or dropped onto the image (only the first file of a drop is used)
     */
    processFile: MultiImageProcessFile;
    /**
     * Called if processFile failed, shows the error to the user
     */
    onImageError: ImageErrorReporter;
    /**
     * Delete confirmation handler
     */
    onDelete?: MultiImageProps["onDelete"];
    /**
     * Custom CSS class to apply to root
     */
    className?: string;
    /**
     * Custom CSS styles
     */
    classes?: Partial<Record<ImageDialogEntryClassKey, string>>;
    /**
     * Nested custom CSS styles
     */
    subClasses?: {
        imageBox?: ImageBoxProps["classes"];
    };
}
/**
 * Slots of ImageDialogEntry (theme CcImageDialogEntry): root (the Grid item), actions (the
 * row of buttons under the image), primaryButton (the make-primary toggle button), and the
 * star and text inside that button: makePrimary for an image that is not the primary one,
 * isPrimary for the primary image
 */
export type ImageDialogEntryClassKey = "root" | "actions" | "primaryButton" | "makePrimary" | "isPrimary";
declare const _default: React.MemoExoticComponent<(inProps: ImageDialogEntryProps) => React.JSX.Element>;
export default _default;
