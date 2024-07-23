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
export const getFileType = (nameOrMime) => {
    if (nameOrMime.includes("/")) {
        if (AudioMimeType.test(nameOrMime))
            return "audio";
        if (ImageMimeType.test(nameOrMime))
            return "image";
        if (VideoMimeType.test(nameOrMime))
            return "video";
        return null;
    }
    else {
        const fileExt = getFileExt(nameOrMime).toLowerCase();
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
        return null;
    }
};
export const getFileIcon = (nameOrMime) => {
    return getFileTypeIcon(getFileType(nameOrMime));
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
export const getFileIconOrDefault = (nameOrMime) => getFileIcon(nameOrMime) ?? DefaultFileIcon;
const File = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcFile" });
    const { downloadLink, variant, className, classes } = props;
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
        return (React.createElement(Grid, { item: true, className: className, style: { width: props.size } },
            React.createElement(Grid, { container: true, spacing: 2 },
                React.createElement(IconContainer, { item: true, xs: 12, className: classes?.iconContainer },
                    removeBtn,
                    renderIcon()),
                React.createElement(Grid, { item: true, xs: 12 }, renderName()))));
    }
    else if (variant === "list") {
        return (React.createElement(Grid, { item: true, xs: 12, onClick: handleListClick, container: true, spacing: 2, alignItems: "stretch", wrap: "nowrap", className: className },
            React.createElement(Grid, { item: true }, renderIcon()),
            React.createElement(ListEntryText, { item: true, xs: true, className: classes?.listEntryText }, renderName()),
            removeBtn && React.createElement(Grid, { item: true }, removeBtn)));
    }
    else if (variant === "compact-list") {
        return (React.createElement(CompactListWrapper, { item: true, onClick: handleListClick, className: combineClassNames([className, classes?.compactListWrapper]) },
            React.createElement(Grid, { container: true, spacing: 2, alignItems: "stretch", wrap: "nowrap" },
                React.createElement(Grid, { item: true }, renderIcon()),
                React.createElement(ListEntryText, { item: true, className: classes?.listEntryText }, renderName()),
                removeBtn && React.createElement(Grid, { item: true }, removeBtn))));
    }
    else if (variant === "icon-only") {
        return (React.createElement(CompactListWrapper, { item: true, onClick: handleListClick, className: combineClassNames([className, classes?.compactListWrapper]) },
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
