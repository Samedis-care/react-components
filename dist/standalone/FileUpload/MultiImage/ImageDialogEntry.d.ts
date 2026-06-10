import React from "react";
import { ImageBoxProps } from "./ImageBox";
import { MultiImageImage, MultiImageManipulationCallback, MultiImageProcessFile, MultiImageProps } from "./MultiImage";
export interface ImageDialogEntryProps extends Pick<MultiImageProps, "previewSize"> {
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
     * Function to update primary image ID
     * @param newId The new primary image ID
     */
    changePrimary: (newId: string) => void;
    /**
     * Process image file
     */
    processFile: MultiImageProcessFile;
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
export type ImageDialogEntryClassKey = "root" | "makePrimary" | "isPrimary";
declare const _default: React.MemoExoticComponent<(inProps: ImageDialogEntryProps) => React.JSX.Element>;
export default _default;
