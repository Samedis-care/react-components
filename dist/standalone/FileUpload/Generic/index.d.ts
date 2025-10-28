import React from "react";
import { FileSelectorError } from "./Errors";
import { IDownscaleProps } from "../../../utils/processImage";
export interface FileUploadProps {
    /**
     * The HTML name attribute on the upload button
     */
    name?: string;
    /**
     * Maximum amount of files allowed
     */
    maxFiles?: number;
    /**
     * Filter for allowed mime types and file extensions (see <input accept="VALUE">)
     */
    accept?: string;
    /**
     * Custom label for accepted file formats ("File formats:" prefix is prepended)
     */
    acceptLabel?: string;
    /**
     * Optional resolution restrictions for images
     */
    imageDownscaleOptions?: IDownscaleProps;
    /**
     * Optional mime type to convert images to
     */
    convertImagesTo?: string;
    /**
     * Properties for preview
     */
    previewSize: number;
    /**
     * The label type of the box
     */
    smallLabel?: boolean;
    /**
     * Should we show images instead of file icons?
     */
    previewImages?: boolean;
    /**
     * Should file duplicates be allowed? If not files with the same file name will be replaced
     */
    allowDuplicates?: boolean;
    /**
     * Called if an error occurred. Should provide feedback to the user
     * @param err The error that occurred
     * @param message A localized, human readable message
     */
    handleError: (err: FileSelectorError, message: string) => void;
    /**
     * Currently displayed files (for controlled input. for uncontrolled use defaultFiles)
     */
    files?: FileData<FileMeta>[];
    /**
     * Already selected files (for loading existing data)
     */
    defaultFiles?: FileData<FileMeta>[];
    /**
     * Called on file selection update
     * @param files The newly selected files
     */
    onChange?: (files: FileData[]) => void;
    /**
     * onBlur event handler
     */
    onBlur?: React.FocusEventHandler<HTMLElement>;
    /**
     * Custom label for the upload files button
     */
    uploadLabel?: string;
    /**
     * Makes the file upload control read only
     */
    readOnly?: boolean;
    /**
     * The label of the component
     */
    label?: string;
    /**
     * CSS class to apply to root
     */
    className?: string;
    /**
     * Custom CSS classes for styling
     */
    classes?: Partial<Record<FileUploadClassKey, string>>;
    /**
     * Variant (design) to use
     * @default classic
     * @remarks When using 'modern' preview size should be set to 24
     */
    variant?: "classic" | "modern" | React.ComponentType<FileUploadRendererProps>;
}
export interface FileUploadRendererProps extends Omit<FileUploadProps, "variant" | "onChange" | "defaultFiles" | "files"> {
    /**
     * Drag over event handler for drop zone
     */
    handleDragOver: React.DragEventHandler;
    /**
     * Drop handler for drop zone
     */
    handleDrop: React.DragEventHandler;
    /**
     * Dragging flag to display "drop here" styles
     */
    dragging: boolean;
    /**
     * Open the upload dialog
     */
    handleUpload: (capture?: FileCaptureConfig) => void;
    /**
     * Get remaining uploadable file count (maxFiles - currentFiles).
     * @remarks Only call when maxFiles is specified!
     */
    getRemainingFileCount: () => number;
    /**
     * onChange handler for file input
     */
    handleFileChange: React.ChangeEventHandler<HTMLInputElement>;
    /**
     * ref for file input
     */
    inputRef: React.MutableRefObject<HTMLInputElement | null>;
    /**
     * The current files
     */
    files: FileData[];
    /**
     * Remove a file
     * @param file The file to remove
     */
    removeFile: (file: FileData) => void;
}
export interface FileMeta {
    /**
     * The file name
     */
    name: string;
    /**
     * The file mime type
     */
    type: string;
    /**
     * The download link for the file
     */
    downloadLink?: string;
}
export interface FileData<T = File | FileMeta> {
    /**
     * The file from the file upload
     */
    file: T;
    /**
     * Prevent the file from getting deleted
     */
    preventDelete?: boolean;
    /**
     * The file can be uploaded? (has it been selected by the user?)
     * If canBeUploaded is true T is File, otherwise T is FileMeta
     */
    canBeUploaded?: boolean;
    /**
     * The processed image, if present: should be uploaded instead of file.
     */
    preview?: string;
    /**
     * Set to true if the file should be deleted from the server, only true if canBeUploaded is false
     */
    delete?: boolean;
}
export interface FileUploadDispatch {
    /**
     * Add the given file as if the user selected it
     * @param file The file
     */
    addFile: (file: File) => Promise<void>;
    /**
     * Open the upload dialog
     */
    openUploadDialog: (capture?: FileCaptureConfig) => void;
}
export interface FileCaptureConfig {
    type: "image" | "audio" | "video";
    source: "user" | "environment";
}
export declare const FileInput: React.ComponentType<React.InputHTMLAttributes<HTMLInputElement> & React.RefAttributes<HTMLInputElement>>;
export type FileUploadClassKey = "root" | "dropzone" | "formatTextModern" | "formatIconsModern" | "fileInput" | "formatText" | "modernUploadLabel";
declare const _default: React.ForwardRefExoticComponent<Omit<FileUploadProps & React.RefAttributes<FileUploadDispatch>, "ref"> & React.RefAttributes<FileUploadDispatch>>;
export default _default;
