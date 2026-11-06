import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useMemo } from "react";
import { Grid, styled, Tooltip, Typography, useThemeProps, } from "@mui/material";
import { Cancel as CancelIconList, CancelOutlined as CancelIcon, InsertDriveFile as DefaultFileIcon, RestoreFromTrash as RestoreIconSvg, } from "@mui/icons-material";
import { ArchiveFileIcon, AudioFileIcon, CodeFileIcon, CsvFileIcon, ExcelFileIcon, ImageFileIcon, PdfFileIcon, PowerPointFileIcon, TextFileIcon, VideoFileIcon, WordFileIcon, } from "../FileIcons";
import dataToFile from "../../../utils/dataToFile";
import combineClassNames from "../../../utils/combineClassNames";
import getFileExt from "../../../utils/getFileExt";
import useObjectUrl from "../../../utils/useObjectUrl";
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
/**
 * Makes the control that opens a file (a link, or a button with onClick, see
 * FileProps.downloadLink) look like the plain name or icon, and gives it an outline on
 * keyboard focus. On the plain `p` and `div` these declarations change nothing.
 */
const openControlStyles = (theme) => ({
    display: "block",
    padding: 0,
    border: 0,
    background: "none",
    color: "inherit",
    textDecoration: "none",
    "&:focus-visible": {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: 2,
    },
});
const IconWrapperList = styled("div", {
    name: "CcFile",
    slot: "iconWrapperList",
})(({ theme }) => ({
    ...openControlStyles(theme),
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
/**
 * Marks a file as added or removed relative to the server side state
 * @remarks Applied to the file name rather than to the icon, see FileProps.changeState
 */
const changeStateStyles = (theme) => ({
    '&[data-cc-change="added"]': {
        color: theme.palette.success.main,
    },
    '&[data-cc-change="removed"]': {
        textDecoration: "line-through",
    },
});
const StyledLabelList = styled(Typography, {
    name: "CcFile",
    slot: "listLabel",
})(({ theme }) => ({
    ...openControlStyles(theme),
    position: "absolute",
    maxWidth: "100%",
    "&.Mui-active": {
        cursor: "pointer",
        "&:hover": {
            textDecoration: "underline",
        },
    },
    ...changeStateStyles(theme),
}));
const StyledLabel = styled(Typography, {
    name: "CcFile",
    slot: "label",
})(({ theme }) => ({
    ...openControlStyles(theme),
    // a button is only as wide as its text otherwise
    width: "100%",
    "&.Mui-active": {
        cursor: "pointer",
        "&:hover": {
            textDecoration: "underline",
        },
    },
    ...changeStateStyles(theme),
}));
// mirrors the CloseIcon/CloseIconList pair: the box variant positions its action over
// the icon, every other variant lays it out inline
const RestoreIconBox = styled(RestoreIconSvg, {
    name: "CcFile",
    slot: "restoreIconBox",
})(({ theme }) => ({
    position: "absolute",
    cursor: "pointer",
    color: theme.palette.action.active,
}));
const RestoreIcon = styled(RestoreIconSvg, {
    name: "CcFile",
    slot: "restoreIcon",
})(({ theme }) => ({
    width: "auto",
    position: "static",
    cursor: "pointer",
    color: theme.palette.action.active,
}));
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
/**
 * The URL schemes a file's link may have. Any other (`javascript:`, `vbscript:`, …) does
 * not count as a link: opening it would run script with access to the app window.
 */
const LINK_PROTOCOLS = ["http:", "https:", "blob:", "data:"];
/**
 * The scheme of a file's link, if it counts as a link
 * @param url The link: absolute, or relative to the page
 * @returns The scheme as the browser reads it (lower case, with the colon, after leading
 *          spaces and control characters and with tabs and newlines removed), or null for
 *          no link, a link that cannot be parsed and a scheme not in LINK_PROTOCOLS
 */
const getLinkProtocol = (url) => {
    if (!url)
        return null;
    let protocol;
    try {
        protocol = new URL(url, document.baseURI).protocol;
    }
    catch {
        return null;
    }
    return LINK_PROTOCOLS.includes(protocol) ? protocol : null;
};
/**
 * Opens a file's link in a new tab, without giving that tab access to the app window
 * (`window.opener`) and without sending a referrer
 * @param url A link getLinkProtocol accepted
 */
const openInNewTab = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
};
/**
 * One file of FileUploadGeneric: its icon or image preview, its name, and its remove or
 * restore control. The default export of this module, imported as FilePreview by apps.
 * @remarks A file with a link is opened by keyboard through its name (in icon-only its
 *          icon), see FileProps.downloadLink.
 */
const File = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcFile" });
    const { name, downloadLink, variant, className, classes, onClick } = props;
    const FileIcon = getFileIconOrDefault(props.name, props.mimeType);
    const previewSrc = useObjectUrl(props.preview);
    const downloadUrl = useObjectUrl(downloadLink);
    const linkProtocol = useMemo(() => getLinkProtocol(downloadUrl), [downloadUrl]);
    const hasLink = linkProtocol != null;
    const openDownload = useCallback(async () => {
        if (!downloadUrl || !linkProtocol)
            return;
        if (linkProtocol === "data:") {
            const url = URL.createObjectURL(dataToFile(downloadUrl));
            if (onClick)
                await onClick(name, url);
            else
                openInNewTab(url);
            URL.revokeObjectURL(url);
        }
        else {
            if (onClick)
                await onClick(name, downloadUrl);
            else
                openInNewTab(downloadUrl);
        }
    }, [downloadUrl, linkProtocol, name, onClick]);
    // a click on the open control, also one by keyboard. openDownload opens the file, not
    // the browser: a data: link needs an object URL, and onClick replaces opening it.
    const handleOpen = useCallback((evt) => {
        evt.preventDefault();
        void openDownload();
    }, [openDownload]);
    // what makes the name (icon-only: the icon) the control that opens the file
    const openControl = useMemo(() => !hasLink
        ? undefined
        : onClick
            ? {
                component: "button",
                props: { type: "button", onClick: handleOpen },
            }
            : {
                component: "a",
                props: {
                    href: downloadUrl,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    onClick: handleOpen,
                },
            }, [hasLink, onClick, handleOpen, downloadUrl]);
    const handleListClick = useCallback((evt) => {
        evt.stopPropagation();
    }, []);
    const isList = variant === "list" || variant === "compact-list" || variant === "icon-only";
    const renderIcon = () => {
        const IconWrapperComp = isList ? IconWrapperList : IconWrapper;
        // icon-only shows no name, so its icon is the open control
        const control = variant === "icon-only" ? openControl : undefined;
        // elsewhere a click on the icon opens the file too, for the mouse only: the name
        // is the control
        const iconClick = hasLink && !control ? openDownload : undefined;
        return (_jsx(IconWrapperComp, { as: control?.component, ...control?.props, className: combineClassNames([
                isList ? classes?.iconWrapperList : classes?.iconWrapper,
                props.disabled && "Mui-disabled",
                hasLink && "Mui-active",
            ]), children: props.preview ? (_jsx("img", { src: previewSrc, alt: props.name, onClick: iconClick, style: { height: props.size } })) : (_jsx(FileIcon, { onClick: iconClick, style: { height: props.size } })) }));
    };
    const renderName = () => {
        const TypographyComp = variant === "list" ? StyledLabelList : StyledLabel;
        const nameProps = {
            align: isList ? "left" : "center",
            noWrap: true,
            className: combineClassNames([
                variant === "list" ? classes?.listLabel : classes?.label,
                hasLink && "Mui-active",
            ]),
            "data-cc-change": props.changeState,
            variant: "body2",
            style: isList
                ? {
                    lineHeight: `${props.size}px`,
                }
                : undefined,
            children: props.label ?? props.name,
        };
        return (_jsx(Tooltip, { title: props.name, children: openControl ? (_jsx(TypographyComp, { ...nameProps, component: openControl.component, ...openControl.props })) : (_jsx(TypographyComp, { ...nameProps })) }));
    };
    const restoreBtn = props.changeState === "removed" &&
        props.onRestore &&
        React.createElement(variant === "box" ? RestoreIconBox : RestoreIcon, {
            className: combineClassNames([
                variant === "box" ? classes?.restoreIconBox : classes?.restoreIcon,
            ]),
            onClick: props.onRestore,
            style: variant === "list" ? { height: props.size } : undefined,
            titleAccess: props.restoreLabel,
        });
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
    // a removed file offers a restore where it used to offer a remove
    const actionBtn = restoreBtn || removeBtn;
    if (variant === "box") {
        return (_jsx(Grid, { className: className, style: { width: props.size }, children: _jsxs(Grid, { container: true, spacing: 2, children: [_jsxs(IconContainer, { size: 12, className: classes?.iconContainer, children: [actionBtn, renderIcon()] }), _jsx(Grid, { size: 12, children: renderName() })] }) }));
    }
    else if (variant === "list") {
        return (_jsxs(Grid, { onClick: handleListClick, container: true, spacing: 2, sx: { alignItems: "stretch" }, wrap: "nowrap", className: className, size: 12, children: [_jsx(Grid, { children: renderIcon() }), _jsx(ListEntryText, { size: "grow", className: classes?.listEntryText, children: renderName() }), actionBtn && _jsx(Grid, { children: actionBtn })] }));
    }
    else if (variant === "compact-list") {
        return (_jsx(CompactListWrapper, { onClick: handleListClick, className: combineClassNames([className, classes?.compactListWrapper]), children: _jsxs(Grid, { container: true, spacing: 2, sx: { alignItems: "stretch" }, wrap: "nowrap", children: [_jsx(Grid, { children: renderIcon() }), _jsx(ListEntryText, { className: classes?.listEntryText, children: renderName() }), actionBtn && _jsx(Grid, { children: actionBtn })] }) }));
    }
    else if (variant === "icon-only") {
        return (_jsx(CompactListWrapper, { onClick: handleListClick, className: combineClassNames([className, classes?.compactListWrapper]), children: _jsxs(Grid, { container: true, spacing: 2, sx: { alignItems: "stretch" }, wrap: "nowrap", children: [_jsx(Grid, { children: _jsx(Tooltip, { title: props.name, children: openControl ? renderIcon() : _jsx("span", { children: renderIcon() }) }) }), actionBtn && _jsx(Grid, { children: actionBtn })] }) }));
    }
    else {
        throw new Error("Invalid variant passed");
    }
};
export default React.memo(File);
