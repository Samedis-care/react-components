import React from "react";
import { ImageBoxProps } from "./ImageBox";
import { Theme } from "@material-ui/core";
import { MultiImageImage, MultiImageManipulationCallback, MultiImageProcessFile, MultiImageProps } from "./MultiImage";
import { Styles } from "@material-ui/core/styles/withStyles";
import { ClassNameMap } from "@material-ui/styles/withStyles";
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
     * Custom CSS styles
     */
    classes?: ClassNameMap<ImageDialogEntryClassKey>;
    /**
     * Nested custom CSS styles
     */
    subClasses?: {
        imageBox?: ImageBoxProps["classes"];
    };
}
declare const useStyles: (props?: any) => ClassNameMap<"clickable">;
export declare type ImageDialogEntryClassKey = keyof ReturnType<typeof useStyles>;
export declare type ImageDialogEntryTheme = Partial<Styles<Theme, ImageDialogEntryProps, ImageDialogEntryClassKey>>;
declare const _default: React.MemoExoticComponent<(props: ImageDialogEntryProps) => JSX.Element>;
export default _default;
