import React, { useCallback } from "react";
import { Grid, styled, Tooltip, Typography, useThemeProps, } from "@mui/material";
import { Cancel as CancelIconList, CancelOutlined as CancelIcon, InsertDriveFile as DefaultFileIcon, } from "@mui/icons-material";
import { ArchiveFileIcon, AudioFileIcon, CodeFileIcon, CsvFileIcon, ExcelFileIcon, ImageFileIcon, PdfFileIcon, PowerPointFileIcon, TextFileIcon, VideoFileIcon, WordFileIcon, } from "../FileIcons";
import dataToFile from "../../../utils/dataToFile";
import combineClassNames from "../../../utils/combineClassNames";
import getFileExt from "../../../utils/getFileExt";
const CompactListWrapper = styled(Grid, {
    name: "CcFile",
    slot: "compactListWrapper",
})({
    maxWidth: "100%",
});
const IconContainer = styled(Grid, { name: "CcFile", slot: "iconContainer" })({
    position: "relative",
});
const ListEntryText = styled(Grid, { name: "CcFile", slot: "listEntryText" })({
    minWidth: 0,
    position: "relative",
});
const CloseIconList = styled(CancelIconList, {
    name: "CcFile",
    slot: "closeIconList",
})(({ theme }) => ({
    width: "auto",
    position: "static",
    cursor: "pointer",
    color: theme.palette.action.active,
}));
const CloseIcon = styled(CancelIcon, {
    name: "CcFile",
    slot: "closeIcon",
})(({ theme }) => ({
    position: "absolute",
    cursor: "pointer",
    color: theme.palette.error.main,
}));
const RemoveIcon = styled(CancelIcon, {
    name: "CcFile",
    slot: "removeIcon",
})({
    cursor: "pointer",
});
const IconWrapperList = styled("div", {
    name: "CcFile",
    slot: "iconWrapperList",
})(({ theme }) => ({
    height: "100%",
    width: "auto",
    color: theme.palette.error.main,
    "&.Mui-disabled": {
        opacity: 0.5,
    },
    "&.Mui-active": {
        cursor: "pointer",
    },
}));
const IconWrapper = styled("div", {
    name: "CcFile",
    slot: "iconWrapper",
})({
    width: "100%",
    height: "auto",
    marginTop: 16,
    objectFit: "contain",
});
const StyledLabelList = styled(Typography, {
    name: "CcFile",
    slot: "listLabel",
})({
    position: "absolute",
    maxWidth: "100%",
    "&.Mui-active": {
        cursor: "pointer",
        "&:hover": {
            textDecoration: "underline",
        },
    },
});
const StyledLabel = styled(Typography, {
    name: "CcFile",
    slot: "label",
})({
    "&.Mui-active": {
        cursor: "pointer",
        "&:hover": {
            textDecoration: "underline",
        },
    },
});
export const ExcelFileExtensions = [
    "xlsx",
    "xlsm",
    "xltx",
    "xltm",
    "xls",
    "xlt",
    "xlm",
];
export const ExcelMimeType = [
    "application/vnd.ms-excel",
    "application/vnd.ms-excel.addin.macroenabled.12",
    "application/vnd.ms-excel.sheet.binary.macroenabled.12",
    "application/vnd.ms-excel.sheet.macroenabled.12",
    "application/vnd.ms-excel.template.macroenabled.12",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.template",
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
export const WordMimeType = [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
    "application/msword",
    "application/vnd.ms-word.document.macroenabled.12",
    "application/vnd.ms-word.template.macroenabled.12",
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
export const PowerPointMimeType = [
    "application/vnd.ms-powerpoint",
    "application/vnd.ms-powerpoint.addin.macroenabled.12",
    "application/vnd.ms-powerpoint.presentation.macroenabled.12",
    "application/vnd.ms-powerpoint.slide.macroenabled.12",
    "application/vnd.ms-powerpoint.slideshow.macroenabled.12",
    "application/vnd.ms-powerpoint.template.macroenabled.12",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.openxmlformats-officedocument.presentationml.slide",
    "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
    "application/vnd.openxmlformats-officedocument.presentationml.template",
];
export const ArchiveFileExtensions = ["zip", "7z", "rar", "tar"];
export const ArchiveMimeType = [
    "application/x-zip-compressed",
    "application/zip",
    "application/zip-compressed",
    "application/x-7z-compressed",
    "application/x-rar-compressed",
    "application/vnd.rar",
    "application/x-tar",
];
export const AudioFileExtensions = [
    "acc",
    "mp3",
    "wav",
    "ogg",
    "oga",
    "opus",
    "weba",
];
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
export const CodeMimeType = [
    "text/javascript",
    "text/css",
    "text/html",
    "application/xml",
];
export const CsvFileExtensions = ["csv"];
export const TextFileExtensions = ["txt"];
export const TextFileMimeType = ["text/plain"];
export const VideoFileExtensions = [
    "mp4",
    "mov",
    "mkv",
    "avi",
    "mpeg",
    "ogv",
    "webm",
    "3gp",
    "3g2",
];
export const AudioMimeType = /^audio\//;
export const ImageMimeType = /^image\//;
export const VideoMimeType = /^video\//;
export const PdfFileExtensions = ["pdf"];
export const PdfMimeType = ["application/pdf"];
export const CsvMimeType = ["text/csv"];
export const getFileType = (fileName, mimeType) => {
    if (mimeType && mimeType.includes("/")) {
        if (ArchiveMimeType.includes(mimeType))
            return "archive";
        if (AudioMimeType.test(mimeType))
            return "audio";
        if (CodeMimeType.includes(mimeType))
            return "code";
        if (CsvMimeType.includes(mimeType))
            return "csv";
        if (ExcelMimeType.includes(mimeType))
            return "excel";
        if (ImageMimeType.test(mimeType))
            return "image";
        if (PdfMimeType.includes(mimeType))
            return "pdf";
        if (PowerPointMimeType.includes(mimeType))
            return "power-point";
        if (TextFileMimeType.includes(mimeType))
            return "text";
        if (VideoMimeType.test(mimeType))
            return "video";
        if (WordMimeType.includes(mimeType))
            return "word";
    }
    if (fileName) {
        const fileExt = getFileExt(fileName).toLowerCase();
        if (ArchiveFileExtensions.includes(fileExt))
            return "archive";
        if (AudioFileExtensions.includes(fileExt))
            return "audio";
        if (CodeFileExtensions.includes(fileExt))
            return "code";
        if (CsvFileExtensions.includes(fileExt))
            return "csv";
        if (ExcelFileExtensions.includes(fileExt))
            return "excel";
        if (ImageFileExtensions.includes(fileExt))
            return "image";
        if (PdfFileExtensions.includes(fileExt))
            return "pdf";
        if (PowerPointFileExtensions.includes(fileExt))
            return "power-point";
        if (TextFileExtensions.includes(fileExt))
            return "text";
        if (VideoFileExtensions.includes(fileExt))
            return "video";
        if (WordFileExtensions.includes(fileExt))
            return "word";
    }
    return null;
};
export const getFileIcon = (fileName, mimeType) => {
    return getFileTypeIcon(getFileType(fileName, mimeType));
};
export const getFileTypeIcon = (type) => {
    switch (type) {
        case "archive":
            return ArchiveFileIcon;
        case "audio":
            return AudioFileIcon;
        case "code":
            return CodeFileIcon;
        case "csv":
            return CsvFileIcon;
        case "excel":
            return ExcelFileIcon;
        case "image":
            return ImageFileIcon;
        case "pdf":
            return PdfFileIcon;
        case "power-point":
            return PowerPointFileIcon;
        case "text":
            return TextFileIcon;
        case "video":
            return VideoFileIcon;
        case "word":
            return WordFileIcon;
        default:
            return null;
    }
};
export const getFileIconOrDefault = (fileName, mimeType) => getFileIcon(fileName, mimeType) ?? DefaultFileIcon;
const File = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcFile" });
    const { name, downloadLink, variant, className, classes, onClick } = props;
    const FileIcon = getFileIconOrDefault(props.name, props.mimeType);
    const openDownload = useCallback(async () => {
        if (downloadLink) {
            if (downloadLink.startsWith("data:")) {
                const url = URL.createObjectURL(dataToFile(downloadLink));
                if (onClick)
                    await onClick(name, url);
                else
                    window.open(url, "_blank");
                URL.revokeObjectURL(url);
            }
            else {
                if (onClick)
                    await onClick(name, downloadLink);
                else
                    window.open(downloadLink, "_blank");
            }
        }
    }, [downloadLink, name, onClick]);
    const handleListClick = useCallback((evt) => {
        evt.stopPropagation();
    }, []);
    const isList = variant === "list" || variant === "compact-list" || variant === "icon-only";
    const renderIcon = () => {
        const IconWrapperComp = isList ? IconWrapperList : IconWrapper;
        return (React.createElement(IconWrapperComp, { className: combineClassNames([
                isList ? classes?.iconWrapperList : classes?.iconWrapper,
                props.disabled && "Mui-disabled",
                downloadLink && "Mui-active",
            ]) }, props.preview ? (React.createElement("img", { src: props.preview, alt: props.name, onClick: openDownload, style: { height: props.size } })) : (React.createElement(FileIcon, { onClick: openDownload, style: { height: props.size } }))));
    };
    const renderName = () => {
        const TypographyComp = variant === "list" ? StyledLabelList : StyledLabel;
        return (React.createElement(Tooltip, { title: props.name },
            React.createElement(TypographyComp, { align: isList ? "left" : "center", noWrap: true, className: combineClassNames([
                    variant === "list" ? classes?.listLabel : classes?.label,
                    downloadLink && "Mui-active",
                ]), onClick: openDownload, variant: "body2", style: isList
                    ? {
                        lineHeight: `${props.size}px`,
                    }
                    : undefined }, props.label ?? props.name)));
    };
    const removeBtn = props.onRemove &&
        !props.disabled &&
        React.createElement(variant === "list"
            ? CloseIconList
            : variant === "box"
                ? CloseIcon
                : RemoveIcon, {
            className: combineClassNames([
                variant === "box" && classes?.closeIcon,
                variant === "list" && classes?.closeIconList,
                variant !== "box" && variant !== "list" && classes?.removeIcon,
            ]),
            onClick: props.onRemove,
            style: variant === "list" ? { height: props.size } : undefined,
        });
    if (variant === "box") {
        return (React.createElement(Grid, { className: className, style: { width: props.size } },
            React.createElement(Grid, { container: true, spacing: 2 },
                React.createElement(IconContainer, { size: 12, className: classes?.iconContainer },
                    removeBtn,
                    renderIcon()),
                React.createElement(Grid, { size: 12 }, renderName()))));
    }
    else if (variant === "list") {
        return (React.createElement(Grid, { onClick: handleListClick, container: true, spacing: 2, alignItems: "stretch", wrap: "nowrap", className: className, size: 12 },
            React.createElement(Grid, null, renderIcon()),
            React.createElement(ListEntryText, { size: "grow", className: classes?.listEntryText }, renderName()),
            removeBtn && React.createElement(Grid, null, removeBtn)));
    }
    else if (variant === "compact-list") {
        return (React.createElement(CompactListWrapper, { onClick: handleListClick, className: combineClassNames([className, classes?.compactListWrapper]) },
            React.createElement(Grid, { container: true, spacing: 2, alignItems: "stretch", wrap: "nowrap" },
                React.createElement(Grid, null, renderIcon()),
                React.createElement(ListEntryText, { className: classes?.listEntryText }, renderName()),
                removeBtn && React.createElement(Grid, null, removeBtn))));
    }
    else if (variant === "icon-only") {
        return (React.createElement(CompactListWrapper, { onClick: handleListClick, className: combineClassNames([className, classes?.compactListWrapper]) },
            React.createElement(Grid, { container: true, spacing: 2, alignItems: "stretch", wrap: "nowrap" },
                React.createElement(Grid, null,
                    React.createElement(Tooltip, { title: props.name },
                        React.createElement("span", null, renderIcon()))),
                removeBtn && React.createElement(Grid, null, removeBtn))));
    }
    else {
        throw new Error("Invalid variant passed");
    }
};
export default React.memo(File);
