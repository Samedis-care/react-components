import React from "react";
import { SvgIconProps } from "@mui/material";
/**
 * A file's pending change relative to the server side state
 */
export type FileChangeState = "added" | "removed";
export interface FileProps {
    /**
     * The file name, including extension
     */
    name: string;
    /**
     * Mime Type of the file
     */
    mimeType: string;
    /**
     * the file label
     */
    label?: string;
    /**
     * Optional callback for removing the file
     * @remarks Called by the file's remove button, an IconButton named "Remove <name>" (see
     *          actionButtonRef). The button is shown only with this callback, and not while
     *          disabled or while the restore button is shown in its place.
     */
    onRemove?: () => void;
    /**
     * The file's pending change relative to the server, if any
     * @remarks Marks the file name: green for a file the user added, struck through for
     *          one they removed. Not the icon — in the list variants that is already
     *          `palette.error.main` — and removal is not coloured at all, because red
     *          reads as an error and this is a pending change, not a problem.
     */
    changeState?: FileChangeState;
    /**
     * Optional callback for undoing a pending removal
     * @remarks Called by the file's restore button, an IconButton named "Restore <name>",
     *          shown in place of the remove button while changeState is "removed". It is the
     *          same button element: a remove or restore turns it into the other, and keyboard
     *          focus stays on it.
     */
    onRestore?: () => void;
    /**
     * Ref to the file's remove or restore button
     * @remarks Set while one of the two is shown, null otherwise. A list that removes the
     *          file uses it to move keyboard focus on when the focused button goes away;
     *          FileUploadGeneric does so for its built-in variants.
     */
    actionButtonRef?: React.Ref<HTMLButtonElement>;
    /**
     * The size of the preview
     */
    size: number;
    /**
     * The preview to show instead of the file icon: a URL, or an image the user picked
     */
    preview?: string | Blob;
    /**
     * Display grayed-out (marked as deleted)
     */
    disabled: boolean;
    /**
     * The download link to open if the file is clicked: a URL, or the file itself
     * @remarks A Blob is opened through an object URL, revoked once the link changes or
     *          the file unmounts
     *
     *          The link is opened in a new tab that gets no access to the app window
     *          (`noopener`) and no referrer. Only http(s), blob and data URLs, and URLs
     *          relative to the page, count as a link. A link with any other scheme (e.g.
     *          `javascript:`) is ignored: the file is shown as one without a link, nothing
     *          opens and onClick is not called.
     *
     *          A file with a link is opened through one control: its name (in icon-only
     *          its icon) is a link to the file (`<a href target="_blank">`), or a button
     *          with onClick. It is a tab stop, named by name and activated with Enter, as
     *          a click does. A click on the icon or the preview opens the file as well.
     *          Without a link the name is plain text and nothing is focusable.
     */
    downloadLink?: string | Blob;
    /**
     * CSS class to apply to root element
     */
    className?: string;
    /**
     * Custom styles
     */
    classes?: Partial<Record<FileClassKey, string>>;
    /**
     * Display file as...
     * - box: Box with label below
     * - list: Full width list
     * - compact-list: List with compact width, display inline block
     * - icon only compact list - file name as tooltip, best used with read-only
     */
    variant: "box" | "list" | "compact-list" | "icon-only";
    /**
     * custom onClick handler
     * @remarks Called instead of opening the link, only for a downloadLink that counts as
     *          a link. The control that opens the file is then a button instead of a link
     *          (see downloadLink).
     * @param name The file name including extension
     * @param url The file URL. For a Blob or data URI link an object URL, which stays
     *            valid at least until the handler has resolved
     */
    onClick?: (name: string, url: string) => Promise<void> | void;
}
export type FileClassKey = "actionButton" | "compactListWrapper" | "iconContainer" | "listEntryText" | "closeIconList" | "closeIcon" | "removeIcon" | "iconWrapperList" | "iconWrapper" | "listLabel" | "label" | "restoreIcon" | "restoreIconBox";
export declare const ExcelFileExtensions: string[];
export declare const ExcelMimeType: string[];
export declare const WordFileExtensions: string[];
export declare const WordMimeType: string[];
export declare const PowerPointFileExtensions: string[];
export declare const PowerPointMimeType: string[];
export declare const ArchiveFileExtensions: string[];
export declare const ArchiveMimeType: string[];
export declare const AudioFileExtensions: string[];
export declare const ImageFileExtensions: string[];
export declare const CodeFileExtensions: string[];
export declare const CodeMimeType: string[];
export declare const CsvFileExtensions: string[];
export declare const TextFileExtensions: string[];
export declare const TextFileMimeType: string[];
export declare const VideoFileExtensions: string[];
export declare const AudioMimeType: RegExp;
export declare const ImageMimeType: RegExp;
export declare const VideoMimeType: RegExp;
export declare const PdfFileExtensions: string[];
export declare const PdfMimeType: string[];
export declare const CsvMimeType: string[];
export type FileType = "archive" | "audio" | "code" | "csv" | "excel" | "image" | "pdf" | "power-point" | "text" | "video" | "word" | null;
export declare const getFileType: (fileName: string | null, mimeType: string | null) => FileType;
export declare const getFileIcon: (fileName: string | null, mimeType: string | null) => React.ComponentType<SvgIconProps> | null;
export declare const getFileTypeIcon: (type: FileType) => React.ComponentType<SvgIconProps> | null;
export declare const getFileIconOrDefault: (fileName: string | null, mimeType: string | null) => React.ComponentType<SvgIconProps>;
declare const _default: React.MemoExoticComponent<(inProps: FileProps) => React.JSX.Element>;
export default _default;
