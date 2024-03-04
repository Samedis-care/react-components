import React, { useCallback } from "react";
import { Grid, Tooltip, Typography } from "@mui/material";
import { InsertDriveFile as DefaultFileIcon, CancelOutlined as CancelIcon, Cancel as CancelIconList, } from "@mui/icons-material";
import makeStyles from "@mui/styles/makeStyles";
import { ArchiveFileIcon, AudioFileIcon, CodeFileIcon, CsvFileIcon, ExcelFileIcon, ImageFileIcon, PdfFileIcon, PowerPointFileIcon, TextFileIcon, VideoFileIcon, WordFileIcon, } from "../FileIcons";
import dataToFile from "../../../utils/dataToFile";
import combineClassNames from "../../../utils/combineClassNames";
import getFileExt from "../../../utils/getFileExt";
const useStyles = makeStyles((theme) => ({
    iconContainer: {
        position: "relative",
    },
    closeIcon: {
        position: "absolute",
        cursor: "pointer",
        color: theme.palette.error.main,
    },
    closeIconList: {
        width: "auto",
        position: "static",
        cursor: "pointer",
        color: theme.palette.action.active,
    },
    icon: {
        width: "100%",
        height: "auto",
        marginTop: 16,
        objectFit: "contain",
    },
    iconList: {
        height: "100%",
        width: "auto",
        color: theme.palette.error.main,
    },
    iconDisabled: {
        opacity: 0.5,
    },
    listEntryText: {
        minWidth: 0,
        position: "relative",
    },
    listLabel: {
        position: "absolute",
        maxWidth: "100%",
    },
    compactListWrapper: {
        maxWidth: "100%",
    },
    clickable: {
        cursor: "pointer",
    },
    downloadLink: {
        cursor: "pointer",
        "&:hover": {
            textDecoration: "underline",
        },
    },
}), { name: "CcFile" });
export const ExcelFileExtensions = [
    "xlsx",
    "xlsm",
    "xltx",
    "xltm",
    "xls",
    "xlt",
    "xlm",
];
export const WordFileExtensions = [
    "doc",
    "dot",
    "docx",
    "docm",
    "dotx",
    "dotm",
    "docb",
];
export const PowerPointFileExtensions = [
    "ppt",
    "pot",
    "pps",
    "pptx",
    "pptm",
    "potx",
    "potm",
    "ppsx",
    "ppsm",
    "sldx",
    "sldm",
];
export const ArchiveFileExtensions = ["zip", "7z", "rar", "tar"];
export const AudioFileExtensions = ["mp3", "wav", "ogg"];
export const ImageFileExtensions = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "bmp",
    "svg",
    "webp",
];
export const CodeFileExtensions = [
    "js",
    "jsx",
    "ts",
    "tsx",
    "cs",
    "c",
    "cpp",
    "cxx",
    "h",
    "hpp",
    "py",
    "pyw",
    "rb",
    "html",
    "xml",
    "css",
    "php",
];
export const CsvFileExtensions = ["csv"];
export const TextFileExtensions = ["txt"];
export const VideoFileExtensions = ["mp4", "mkv", "avi"];
export const AudioMimeType = /^audio\//;
export const ImageMimeType = /^image\//;
export const VideoMimeType = /^video\//;
export const PdfFileExtensions = ["pdf"];
export const getFileIcon = (nameOrMime) => {
    if (nameOrMime.includes("/")) {
        if (AudioMimeType.test(nameOrMime))
            return AudioFileIcon;
        if (ImageMimeType.test(nameOrMime))
            return ImageFileIcon;
        if (VideoMimeType.test(nameOrMime))
            return VideoFileIcon;
        return null;
    }
    else {
        const fileExt = getFileExt(nameOrMime).toLowerCase();
        if (ArchiveFileExtensions.includes(fileExt))
            return ArchiveFileIcon;
        if (AudioFileExtensions.includes(fileExt))
            return AudioFileIcon;
        if (CodeFileExtensions.includes(fileExt))
            return CodeFileIcon;
        if (CsvFileExtensions.includes(fileExt))
            return CsvFileIcon;
        if (ExcelFileExtensions.includes(fileExt))
            return ExcelFileIcon;
        if (ImageFileExtensions.includes(fileExt))
            return ImageFileIcon;
        if (PdfFileExtensions.includes(fileExt))
            return PdfFileIcon;
        if (PowerPointFileExtensions.includes(fileExt))
            return PowerPointFileIcon;
        if (TextFileExtensions.includes(fileExt))
            return TextFileIcon;
        if (VideoFileExtensions.includes(fileExt))
            return VideoFileIcon;
        if (WordFileExtensions.includes(fileExt))
            return WordFileIcon;
        return null;
    }
};
export const getFileIconOrDefault = (nameOrMime) => getFileIcon(nameOrMime) ?? DefaultFileIcon;
const File = (props) => {
    const { downloadLink, variant } = props;
    const classes = useStyles(props);
    const FileIcon = getFileIconOrDefault(props.name);
    const openDownload = useCallback(() => {
        if (downloadLink) {
            if (downloadLink.startsWith("data:")) {
                const url = URL.createObjectURL(dataToFile(downloadLink));
                window.open(url, "_blank");
                URL.revokeObjectURL(url);
            }
            else {
                window.open(downloadLink, "_blank");
            }
        }
    }, [downloadLink]);
    const handleListClick = useCallback((evt) => {
        evt.stopPropagation();
    }, []);
    const isList = variant === "list" || variant === "compact-list" || variant === "icon-only";
    const renderIcon = () => props.preview ? (React.createElement("img", { src: props.preview, alt: props.name, className: combineClassNames([
            isList ? classes.iconList : classes.icon,
            props.disabled && classes.iconDisabled,
            downloadLink && classes.clickable,
        ]), onClick: openDownload, style: { height: props.size } })) : (React.createElement(FileIcon, { className: combineClassNames([
            isList ? classes.iconList : classes.icon,
            downloadLink && classes.clickable,
        ]), onClick: openDownload, style: { height: props.size } }));
    const renderName = () => (React.createElement(Tooltip, { title: props.name },
        React.createElement(Typography, { align: isList ? "left" : "center", noWrap: true, className: combineClassNames([
                downloadLink && classes.downloadLink,
                variant === "list" && classes.listLabel,
            ]), onClick: openDownload, variant: "body2", style: isList
                ? {
                    lineHeight: `${props.size}px`,
                }
                : undefined }, props.name)));
    const removeBtn = props.onRemove &&
        !props.disabled &&
        React.createElement(variant === "list" ? CancelIconList : CancelIcon, {
            className: combineClassNames([
                variant === "box" && classes.closeIcon,
                variant === "list" && classes.closeIconList,
            ]),
            onClick: props.onRemove,
            style: variant === "list" ? { height: props.size } : undefined,
        });
    if (variant === "box") {
        return (React.createElement(Grid, { item: true, style: { width: props.size } },
            React.createElement(Grid, { container: true, spacing: 2 },
                React.createElement(Grid, { item: true, xs: 12, className: classes.iconContainer },
                    removeBtn,
                    renderIcon()),
                React.createElement(Grid, { item: true, xs: 12 }, renderName()))));
    }
    else if (variant === "list") {
        return (React.createElement(Grid, { item: true, xs: 12, onClick: handleListClick, container: true, spacing: 2, alignItems: "stretch", wrap: "nowrap" },
            React.createElement(Grid, { item: true }, renderIcon()),
            React.createElement(Grid, { item: true, xs: true, className: classes.listEntryText }, renderName()),
            removeBtn && React.createElement(Grid, { item: true }, removeBtn)));
    }
    else if (variant === "compact-list") {
        return (React.createElement(Grid, { item: true, onClick: handleListClick, className: classes.compactListWrapper },
            React.createElement(Grid, { container: true, spacing: 2, alignItems: "stretch", wrap: "nowrap" },
                React.createElement(Grid, { item: true }, renderIcon()),
                React.createElement(Grid, { item: true, className: classes.listEntryText }, renderName()),
                removeBtn && React.createElement(Grid, { item: true }, removeBtn))));
    }
    else if (variant === "icon-only") {
        return (React.createElement(Grid, { item: true, onClick: handleListClick, className: classes.compactListWrapper },
            React.createElement(Grid, { container: true, spacing: 2, alignItems: "stretch", wrap: "nowrap" },
                React.createElement(Grid, { item: true },
                    React.createElement(Tooltip, { title: props.name },
                        React.createElement("span", null, renderIcon()))),
                removeBtn && React.createElement(Grid, { item: true }, removeBtn))));
    }
    else {
        throw new Error("Invalid variant passed");
    }
};
export default React.memo(File);
