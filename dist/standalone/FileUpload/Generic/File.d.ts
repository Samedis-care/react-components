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
     * @remarks Rendered in place of the remove button while changeState is "removed"
     */
    onRestore?: () => void;
    /**
     * Accessible name for the restore control
     */
    restoreLabel?: string;
    /**
     * The size of the preview
     */
    size: number;
    /**
     * The preview to show instead of the file icon
     */
    preview?: string;
    /**
     * Display grayed-out (marked as deleted)
     */
    disabled: boolean;
    /**
     * The download link to open if the file is clicked
     */
    downloadLink?: string;
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
     * @param name The file name including extension
     * @param url The file URL
     */
    onClick?: (name: string, url: string) => Promise<void> | void;
}
export type FileClassKey = "compactListWrapper" | "iconContainer" | "listEntryText" | "closeIconList" | "closeIcon" | "removeIcon" | "iconWrapperList" | "iconWrapper" | "listLabel" | "label" | "restoreIcon" | "restoreIconBox";
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
