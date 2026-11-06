import React from "react";
import { FileChangeState } from "./File";
import { FileSelectorError } from "./Errors";
import { IDownscaleProps } from "../../../utils/processImage";
import { GroupBoxHTMLProps } from "../../GroupBox";
export interface FileUploadProps {
    /**
     * The HTML name attribute on the upload button
     * @remarks classic: the Upload button; modern: the button around the call to action.
     *          Unset means none.
     */
    name?: string;
    /**
     * Maximum amount of files allowed
     * @remarks Counts every listed file that is not removed, except one with
     *          `excludeFromLimits`.
     */
    maxFiles?: number;
    /**
     * Smallest size a picked file may have, in bytes
     * @remarks Checked against what is uploaded: the processed image where the control
     *          makes one (`FileData.preview`, see `convertImagesTo`,
     *          `imageDownscaleOptions` and `previewImages`), otherwise the file. A
     *          selection with a smaller file is refused as a whole
     *          (`files.size.too-small`). Unset means no minimum.
     */
    minFileSize?: number;
    /**
     * Largest size a picked file may have, in bytes
     * @remarks Checked like `minFileSize`, so a photo counts at its processed size. A
     *          selection with a larger file is refused as a whole
     *          (`files.size.too-large`). Unset means no maximum.
     */
    maxFileSize?: number;
    /**
     * Largest size all listed files may have together, in bytes
     * @remarks Counts every listed file that is not removed, except one with
     *          `excludeFromLimits`: a picked one at its upload size (see `minFileSize`),
     *          any other at its `FileMeta.size`, which counts as 0 bytes where it is
     *          unset. A selection that would go over the limit is refused as a whole
     *          (`files.selector.too-large`). Unset means no maximum.
     */
    maxTotalFileSize?: number;
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
     * @remarks The replaced file is removed as the remove button removes it: one that exists
     *          on the server stays listed with `delete` set. A file with `preventDelete` is
     *          not replaced, and the new one is listed next to it.
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
     * Callback for delete confirmation, asked before a file is removed with its remove button
     * @param file The file that the user wants to remove
     * @returns Should the file be removed?
     * @remarks The file stays if it returns false, and if it throws or rejects, which is
     *          reported. A file replaced by picking one of the same name is not asked about.
     */
    onDelete?: (file: FileData) => Promise<boolean> | boolean;
    /**
     * Called instead of the built-in restore when a pending removal is undone
     * @remarks The built-in restore just clears the `delete` flag, which is all that is
     *          needed while the removal is only a flag on the file. Where it has already
     *          been handed to a connector queue, only the owner of that queue can undo
     *          it, so that owner takes the callback.
     */
    onRestoreFile?: (file: FileData) => void;
    /**
     * onBlur event handler
     * @remarks Called when the upload button (see `name`) loses focus
     */
    onBlur?: React.FocusEventHandler<HTMLElement>;
    /**
     * Custom label for the upload files button
     * @remarks classic: the Upload button's text, "Upload" by default; modern: the call to
     *          action, "Drag & drop file here or click for an upload dialog" by default.
     *          It is the button's accessible name in both.
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
     * Does the value differ from the server-side value?
     * @remarks Marks the label. Set by the form engine from `RenderParams.dirty`.
     */
    dirty?: boolean;
    /**
     * Is the field busy, e.g. writing its changes?
     * @remarks Sets `aria-busy` on the field. While it is false, the `aria-busy` of
     *          `slotProps.root` applies. A custom variant gets it as well.
     * @default false
     */
    busy?: boolean;
    /**
     * Props for the parts of the control
     * @remarks A custom variant gets them as well.
     */
    slotProps?: {
        /**
         * HTML attributes for the field's frame (`GroupBox`), e.g. `aria-describedby` for an
         * error shown next to it
         * @remarks `className` is added to the frame's own.
         */
        root?: GroupBoxHTMLProps;
    };
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
     * @remarks true while files are dragged anywhere over the page, not only over the drop
     *          zone; dragged text, links and images from the page don't count
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
     * @remarks Adds the picked files as a pick in the built-in variants does, and clears the
     *          input (`value = ""`) right away, so that picking the same file again fires a
     *          change event too. The input's `files` are empty afterwards.
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
    /**
     * Undo a pending removal
     * @param file The file to restore
     */
    restoreFile: (file: FileData) => void;
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
     * @remarks A URL, or the file itself while it is only held locally (e.g. a file whose
     *          upload is queued)
     *
     *          A click on the file opens it in a new tab without access to the app window.
     *          Only http(s), blob and data URLs, and URLs relative to the page, are
     *          opened; a link with any other scheme (e.g. `javascript:`) is shown as no
     *          link.
     */
    downloadLink?: string | Blob;
    /**
     * The file size in bytes, if known
     * @remarks Counts towards `FileUploadProps.maxTotalFileSize`, where a file without it
     *          counts as 0 bytes
     */
    size?: number;
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
     * Leave the file out of `maxFiles` and `maxTotalFileSize`
     * @remarks For a file that is listed but not part of what the limits are about, like
     *          CrudFileUpload's `additionalFiles`.
     */
    excludeFromLimits?: boolean;
    /**
     * The file can be uploaded? (has it been selected by the user?)
     * If canBeUploaded is true T is File, otherwise T is FileMeta
     */
    canBeUploaded?: boolean;
    /**
     * The processed image, if present: should be uploaded instead of file.
     * @remarks A URL for a file from the server, a Blob for an image the user picked
     */
    preview?: string | Blob;
    /**
     * Set to true if the file should be deleted from the server, only true if canBeUploaded is false
     */
    delete?: boolean;
    /**
     * The file's pending change relative to the server, for display
     * @remarks Leave it unset and the control derives the state from the flags above,
     *          which is all a plain FileUpload needs: a picked file has `canBeUploaded`,
     *          a file marked for removal has `delete`.
     *
     *          It exists for CrudFileUpload, where handing an upload to the connector
     *          destroys that signal on purpose: the picked File is replaced by the
     *          `deserialize`d backend representation, so it is no longer a Blob and must
     *          not keep `canBeUploaded` or it would upload twice. With a LazyConnector the
     *          upload is only queued, so it then looks exactly like a file that was
     *          always on the server. A queued removal keeps `delete`.
     */
    changeState?: FileChangeState;
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
export type FileUploadClassKey = "root" | "dropzone" | "formatTextModern" | "formatIconsModern" | "fileInput" | "formatText" | "modernUploadButton" | "modernUploadLabel";
declare const _default: React.ForwardRefExoticComponent<Omit<FileUploadProps & React.RefAttributes<FileUploadDispatch>, "ref"> & React.RefAttributes<FileUploadDispatch>>;
export default _default;
