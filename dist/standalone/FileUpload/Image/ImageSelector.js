import React, { useCallback, useRef, useState } from "react";
import { alpha, Box, Button, Dialog, Grid, IconButton, styled, Tooltip, Typography, useThemeProps, } from "@mui/material";
import { AttachFile, Close as CloseIcon, FileUpload as UploadIcon, Person, } from "@mui/icons-material";
import processImageB64 from "../../../utils/processImageB64";
import combineClassNames from "../../../utils/combineClassNames";
import GroupBox from "../../GroupBox";
import useCCTranslations from "../../../utils/useCCTranslations";
import { ImageFileIcon } from "../FileIcons";
import fileToData from "../../../utils/fileToData";
const RootClassic = styled(Grid, {
    name: "CcImageSelector",
    slot: "rootClassic",
})(({ theme }) => ({
    width: `calc(100% - ${theme.spacing(2)})`,
    height: `calc(100% - ${theme.spacing(2)})`,
    marginTop: theme.spacing(2),
}));
const RootModern = styled(Grid, {
    name: "CcImageSelector",
    slot: "rootModern",
})({
    cursor: "pointer",
    height: "100%",
});
const ImageWrapper = styled(Grid, {
    name: "CcImageSelector",
    slot: "imgWrapper",
})({
    maxHeight: "100%",
});
const PreviewClassic = styled("img", {
    name: "CcImageSelector",
    slot: "previewClassic",
})(({ theme }) => ({
    objectFit: "contain",
    display: "block",
    width: `calc(100% - ${theme.spacing(2)})`,
    height: `calc(100% - ${theme.spacing(2)})`,
}));
const PreviewModern = styled("img", {
    name: "CcImageSelector",
    slot: "previewModern",
})({
    objectFit: "contain",
    display: "block",
    width: "100%",
    height: "100%",
    cursor: "pointer",
});
const ChangeEventHelper = styled("input", {
    name: "CcImageSelector",
    slot: "changeEventHelper",
})({
    display: "none",
});
const ModernUploadLabel = styled(Typography, {
    name: "CcImageSelector",
    slot: "modernUploadLabel",
})(({ theme }) => ({
    color: theme.palette.action.disabled,
}));
const ModernFullHeightBox = styled(Box, {
    name: "CcImageSelector",
    slot: "modernFullHeightBox",
})({
    height: "100%",
});
const ModernFullHeightGrid = styled(Grid, {
    name: "CcImageSelector",
    slot: "modernFullHeightGrid",
})({
    height: "100%",
});
const ModernFormatsLabel = styled(Typography, {
    name: "CcImageSelector",
    slot: "modernFormatsLabel",
})(({ theme }) => ({
    color: theme.palette.action.disabled,
}));
const ModernFormatIcon = styled(ImageFileIcon, {
    name: "CcImageSelector",
    slot: "modernFormatIcon",
})(({ theme }) => ({
    color: theme.palette.action.disabled,
}));
const PfpRoot = styled("div", {
    name: "CcImageSelector",
    slot: "pfpRoot",
})({
    height: "100%",
});
const PfpIconButton = styled(IconButton, {
    name: "CcImageSelector",
    slot: "pfpIconBtn",
})({
    width: "100%",
    height: "100%",
    margin: 2, // borderSize in pfpImg * 2
    padding: 0,
});
const pfpImageStyles = ({ theme }) => ({
    width: "100%",
    height: "100%",
    border: `1px lightgray solid`,
    borderRadius: "50%",
    boxShadow: theme.shadows[4],
    textOverflow: "ellipsis",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    aspectRatio: "1/1",
});
const PfpImage = styled("img", { name: "CcImageSelector", slot: "pfpImg" })(pfpImageStyles);
const PfpImagePlaceholder = styled(Person, {
    name: "CcImageSelector",
    slot: "pfpImgPlaceholder",
})(pfpImageStyles);
const ModernUploadControlsWrapper = styled("div", {
    name: "CcImageSelector",
    slot: "modernUploadControlsWrapper",
})(({ theme }) => ({
    position: "absolute",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    backgroundColor: alpha(theme.palette.background.paper, 0.7),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
}));
const ModernUploadControlUpload = styled(IconButton, {
    name: "CcImageSelector",
    slot: "modernUploadControlUpload",
})(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
}));
const PreviewDialog = styled(Dialog, {
    name: "CcImageSelector",
    slot: "previewDialog",
})({});
const PreviewDialogCloseButton = styled(IconButton, {
    name: "CcImageSelector",
    slot: "previewDialogCloseButton",
})(({ theme }) => ({
    position: "absolute",
    top: theme.spacing(2),
    right: theme.spacing(2),
}));
const ImageSelector = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcImageSelector" });
    const { convertImagesTo, downscale, name, value, readOnly, capture, onChange, postEditCallback, classes, className, } = props;
    const variant = props.variant ?? "normal";
    const fileRef = useRef(null);
    const { t } = useCCTranslations();
    const processFile = useCallback(async (file) => {
        if (!onChange)
            return;
        const imageB64 = await fileToData(file);
        let finalImage;
        try {
            finalImage = postEditCallback
                ? await postEditCallback(imageB64)
                : imageB64;
        }
        catch (e) {
            // probably user cancel
            // eslint-disable-next-line no-console
            console.error("[Components-Care] [ImageSelector] Post edit callback with error (or cancellation)", e);
            return;
        }
        onChange(name, await processImageB64(finalImage, convertImagesTo || file.type, downscale));
    }, [onChange, name, postEditCallback, convertImagesTo, downscale]);
    const handleFileChange = useCallback(async (evt) => {
        const elem = evt.currentTarget;
        const file = elem.files && elem.files[0];
        if (!file)
            return;
        await processFile(file);
    }, [processFile]);
    // upload click handler
    const handleUpload = useCallback(() => {
        const elem = fileRef.current;
        if (!elem)
            return;
        if (capture && capture !== "false") {
            elem.setAttribute("capture", capture);
        }
        elem.click();
    }, [capture]);
    const handleDrop = useCallback(async (evt) => {
        if (readOnly)
            return;
        evt.preventDefault();
        const file = evt.dataTransfer?.files[0];
        if (!file)
            return;
        await processFile(file);
    }, [readOnly, processFile]);
    const handleDragOver = useCallback((evt) => {
        if (readOnly)
            return;
        evt.preventDefault();
    }, [readOnly]);
    const [showPreviewDialog, setShowPreviewDialog] = useState(false);
    const handlePreviewDialog = useCallback(() => {
        setShowPreviewDialog(true);
    }, []);
    const handlePreviewDialogClose = useCallback(() => {
        setShowPreviewDialog(false);
    }, []);
    const previewDialog = showPreviewDialog && (React.createElement(PreviewDialog, { open: true, fullScreen: true, onClose: handlePreviewDialogClose },
        React.createElement(PreviewDialogCloseButton, { onClick: handlePreviewDialogClose },
            React.createElement(CloseIcon, null)),
        React.createElement(PreviewModern, { src: value, alt: props.alt, className: classes?.previewModern })));
    // render component
    if (variant === "normal") {
        return (React.createElement(GroupBox, { label: props.label, smallLabel: props.smallLabel, className: className },
            React.createElement(RootClassic, { container: true, spacing: 2, direction: "column", alignContent: "flex-start", alignItems: "stretch", justifyContent: "center", wrap: "nowrap", className: classes?.rootClassic, onDrop: handleDrop, onDragOver: handleDragOver },
                !props.readOnly && (React.createElement(Grid, { item: true, key: "upload" },
                    React.createElement(Button, { startIcon: React.createElement(AttachFile, null), variant: "contained", color: "primary", name: props.name, onClick: handleUpload, onBlur: props.onBlur }, props.uploadLabel || t("standalone.file-upload.upload")),
                    React.createElement(ChangeEventHelper, { type: "file", accept: "image/*", ref: fileRef, onChange: handleFileChange, className: classes?.changeEventHelper }))),
                React.createElement(ImageWrapper, { item: true, xs: true, key: "image", className: classes?.imgWrapper }, value && (React.createElement(PreviewClassic, { src: value, alt: props.alt, className: classes?.previewClassic }))))));
    }
    else if (variant === "modern") {
        return (React.createElement(React.Fragment, null,
            previewDialog,
            React.createElement(GroupBox, { label: props.label, smallLabel: props.smallLabel, className: className },
                React.createElement(RootModern, { container: true, spacing: 0, direction: "column", alignContent: "flex-start", alignItems: "stretch", justifyContent: "center", wrap: "nowrap", className: classes?.rootModern, onDrop: handleDrop, onDragOver: handleDragOver },
                    !props.readOnly && (React.createElement(ChangeEventHelper, { type: "file", accept: "image/*", ref: fileRef, onChange: handleFileChange, className: classes?.changeEventHelper })),
                    React.createElement(ImageWrapper, { item: true, xs: true, key: "image", className: classes?.imgWrapper, onBlur: props.onBlur, "data-name": props.name }, value ? (React.createElement(React.Fragment, null,
                        React.createElement(Tooltip, { title: props.uploadLabel ??
                                t("standalone.file-upload.upload-modern-dnd") ??
                                "" },
                            React.createElement(PreviewModern, { src: value, alt: props.alt, onClick: handlePreviewDialog, className: classes?.previewModern })),
                        React.createElement(ModernUploadControlsWrapper, null,
                            React.createElement(Tooltip, { title: t("standalone.file-upload.upload-modern-btn") },
                                React.createElement(ModernUploadControlUpload, { onClick: handleUpload },
                                    React.createElement(UploadIcon, null)))))) : (React.createElement(ModernFullHeightBox, { px: 2, className: classes?.modernFullHeightBox },
                        React.createElement(ModernFullHeightGrid, { container: true, onClick: handleUpload, direction: "column", spacing: 0, className: classes?.modernFullHeightGrid },
                            React.createElement(Grid, { item: true, xs: true, container: true, direction: "column", justifyContent: "space-around", wrap: "nowrap" },
                                React.createElement(Grid, { item: true },
                                    React.createElement(ModernUploadLabel, { component: "h1", variant: "h5", className: classes?.modernUploadLabel, align: "center" }, props.uploadLabel ??
                                        t("standalone.file-upload.upload-modern") ??
                                        ""))),
                            React.createElement(Grid, { item: true },
                                React.createElement(Grid, { container: true, wrap: "nowrap", spacing: 0, justifyContent: "space-between" },
                                    React.createElement(Grid, { item: true },
                                        React.createElement(ModernFormatsLabel, { className: classes?.modernFormatsLabel }, props.formatsLabel ??
                                            t("standalone.file-upload.formats-modern") ??
                                            "")),
                                    React.createElement(Grid, { item: true },
                                        React.createElement(ModernFormatIcon, { className: classes?.modernFormatIcon }))))))))))));
    }
    else if (variant === "profile_picture") {
        const image = value ? (React.createElement(PfpImage, { src: value, className: classes?.pfpImg, alt: props.label })) : (React.createElement(PfpImagePlaceholder, { className: classes?.pfpImgPlaceholder }));
        return (React.createElement(PfpRoot, { onDrop: handleDrop, onDragOver: handleDragOver, className: combineClassNames([className, classes?.pfpRoot]) },
            React.createElement(ChangeEventHelper, { type: "file", accept: "image/*", ref: fileRef, onChange: handleFileChange, className: classes?.changeEventHelper }),
            React.createElement(PfpIconButton, { disabled: props.readOnly, onClick: handleUpload, className: classes?.pfpIconBtn, size: "large" }, image)));
    }
    else {
        throw new Error("Unknown variant");
    }
};
export default React.memo(ImageSelector);
