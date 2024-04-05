import React from "react";
import { SvgIconProps } from "@mui/material";
export interface FileProps {
    /**
     * The file name, including extension
     */
    name: string;
    /**
     * Optional callback for removing the file
     */
    onRemove?: () => void;
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
}
export type FileClassKey = "compactListWrapper" | "iconContainer" | "listEntryText" | "closeIconList" | "closeIcon" | "iconWrapperList" | "iconWrapper" | "listLabel" | "label";
export declare const ExcelFileExtensions: string[];
export declare const WordFileExtensions: string[];
export declare const PowerPointFileExtensions: string[];
export declare const ArchiveFileExtensions: string[];
export declare const AudioFileExtensions: string[];
export declare const ImageFileExtensions: string[];
export declare const CodeFileExtensions: string[];
export declare const CsvFileExtensions: string[];
export declare const TextFileExtensions: string[];
export declare const VideoFileExtensions: string[];
export declare const AudioMimeType: RegExp;
export declare const ImageMimeType: RegExp;
export declare const VideoMimeType: RegExp;
export declare const PdfFileExtensions: string[];
export declare const getFileIcon: (nameOrMime: string) => React.ComponentType<SvgIconProps> | null;
export declare const getFileIconOrDefault: (nameOrMime: string) => React.ComponentType<SvgIconProps>;
declare const _default: React.MemoExoticComponent<(inProps: FileProps) => React.JSX.Element>;
export default _default;
