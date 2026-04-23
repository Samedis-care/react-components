import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useCallback, useRef, useState } from "react";
import { alpha, Box, Button, Grid, IconButton, styled, Tooltip, Typography, useThemeProps, } from "@mui/material";
import { AttachFile, FileUpload as UploadIcon, Person, CameraAlt as CameraIcon, } from "@mui/icons-material";
import ImagePreviewDialog from "./ImagePreviewDialog";
import processImageB64 from "../../../utils/processImageB64";
import combineClassNames from "../../../utils/combineClassNames";
import GroupBox from "../../GroupBox";
import useCCTranslations from "../../../utils/useCCTranslations";
import { ImageFileIcon } from "../FileIcons";
import fileToData from "../../../utils/fileToData";
import getCanImageCapture from "../../../utils/getCanImageCapture";
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
const ModernUploadControlsWrapper = styled(Grid, {
    name: "CcImageSelector",
    slot: "modernUploadControlsWrapper",
})(({ theme }) => ({
    position: "absolute",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    backgroundColor: alpha(theme.palette.background.paper, 0.7),
}));
const ModernUploadControlUpload = styled(IconButton, {
    name: "CcImageSelector",
    slot: "modernUploadControlUpload",
})(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
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
        let fileType = file.type;
        try {
            finalImage = postEditCallback
                ? await postEditCallback(imageB64)
                : imageB64;
            if (finalImage.startsWith("data:image/")) {
                fileType = finalImage.substring(5, finalImage.indexOf(";"));
            }
        }
        catch (e) {
            // probably user cancel
            // eslint-disable-next-line no-console
            console.error("[Components-Care] [ImageSelector] Post edit callback with error (or cancellation)", e);
            return;
        }
        onChange(name, await processImageB64(finalImage, convertImagesTo || fileType, downscale));
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
        elem.removeAttribute("capture");
        elem.click();
    }, []);
    const captureEnabled = capture && capture !== "false" && getCanImageCapture();
    const handleUploadCapture = useCallback(() => {
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
    const previewDialog = variant === "modern" && (_jsx(ImagePreviewDialog, { src: value, alt: props.alt, open: showPreviewDialog, onClose: handlePreviewDialogClose }));
    // render component
    if (variant === "normal") {
        return (_jsx(GroupBox, { label: props.label, smallLabel: props.smallLabel, className: className, children: _jsxs(RootClassic, { container: true, spacing: 2, sx: {
                    flexDirection: "column",
                    alignContent: "flex-start",
                    alignItems: "stretch",
                    justifyContent: "center",
                }, wrap: "nowrap", className: classes?.rootClassic, onDrop: handleDrop, onDragOver: handleDragOver, children: [!props.readOnly && (_jsxs(Grid, { container: true, spacing: 1, children: [_jsx(Grid, { children: _jsx(Button, { startIcon: _jsx(AttachFile, {}), variant: "contained", color: "primary", name: props.name, onClick: handleUpload, onBlur: props.onBlur, children: props.uploadLabel || t("standalone.file-upload.upload") }) }), captureEnabled && (_jsx(Grid, { children: _jsx(Button, { startIcon: _jsx(AttachFile, {}), variant: "contained", color: "primary", name: props.name, onClick: handleUploadCapture, onBlur: props.onBlur, children: props.uploadLabelCapture ||
                                        t("standalone.file-upload.upload-capture.image") }) })), _jsx(ChangeEventHelper, { type: "file", accept: "image/*", ref: fileRef, onChange: handleFileChange, className: classes?.changeEventHelper })] }, "upload")), _jsx(ImageWrapper, { size: "grow", className: classes?.imgWrapper, children: value && (_jsx(PreviewClassic, { src: value, alt: props.alt, className: classes?.previewClassic })) }, "image")] }) }));
    }
    else if (variant === "modern") {
        return (_jsxs(_Fragment, { children: [previewDialog, _jsx(GroupBox, { label: props.label, smallLabel: props.smallLabel, className: className, children: _jsxs(RootModern, { container: true, spacing: 0, sx: {
                            flexDirection: "column",
                            alignContent: "flex-start",
                            alignItems: "stretch",
                            justifyContent: "center",
                        }, wrap: "nowrap", className: classes?.rootModern, onDrop: handleDrop, onDragOver: handleDragOver, children: [!props.readOnly && (_jsx(ChangeEventHelper, { type: "file", accept: "image/*", ref: fileRef, onChange: handleFileChange, className: classes?.changeEventHelper })), _jsx(ImageWrapper, { size: "grow", className: classes?.imgWrapper, onBlur: props.onBlur, "data-name": props.name, children: value ? (_jsxs(_Fragment, { children: [_jsx(Tooltip, { title: props.uploadLabel ??
                                                t("standalone.file-upload.upload-modern-dnd") ??
                                                "", children: _jsx(PreviewModern, { src: value, alt: props.alt, onClick: handlePreviewDialog, className: classes?.previewModern }) }), _jsxs(ModernUploadControlsWrapper, { container: true, spacing: 1, children: [_jsx(Grid, { children: _jsx(Tooltip, { title: t("standalone.file-upload.upload-modern-btn"), children: _jsx(ModernUploadControlUpload, { onClick: handleUpload, children: _jsx(UploadIcon, {}) }) }) }), captureEnabled && (_jsx(Grid, { children: _jsx(Tooltip, { title: t("standalone.file-upload.upload-modern-btn-capture.image"), children: _jsx(ModernUploadControlUpload, { onClick: handleUploadCapture, children: _jsx(CameraIcon, {}) }) }) }))] })] })) : (_jsx(ModernFullHeightBox, { sx: { px: 2 }, className: classes?.modernFullHeightBox, children: _jsxs(ModernFullHeightGrid, { container: true, onClick: handleUpload, sx: { flexDirection: "column" }, spacing: 0, className: classes?.modernFullHeightGrid, children: [_jsx(Grid, { container: true, sx: {
                                                    flexDirection: "column",
                                                    justifyContent: "space-around",
                                                }, wrap: "nowrap", size: "grow", children: _jsx(Grid, { children: _jsx(ModernUploadLabel, { component: "h1", variant: "h5", className: classes?.modernUploadLabel, align: "center", children: props.uploadLabel ??
                                                            t("standalone.file-upload.upload-modern") ??
                                                            "" }) }) }), _jsx(Grid, { children: _jsxs(Grid, { container: true, wrap: "nowrap", spacing: 0, sx: { justifyContent: "space-between" }, children: [_jsx(Grid, { children: _jsx(ModernFormatsLabel, { className: classes?.modernFormatsLabel, children: props.formatsLabel ??
                                                                    t("standalone.file-upload.formats-modern") ??
                                                                    "" }) }), _jsx(Grid, { children: _jsx(ModernFormatIcon, { className: classes?.modernFormatIcon }) })] }) })] }) })) }, "image")] }) })] }));
    }
    else if (variant === "profile_picture") {
        const image = value ? (_jsx(PfpImage, { src: value, className: classes?.pfpImg, alt: props.label })) : (_jsx(PfpImagePlaceholder, { className: classes?.pfpImgPlaceholder }));
        return (_jsxs(PfpRoot, { onDrop: handleDrop, onDragOver: handleDragOver, className: combineClassNames([className, classes?.pfpRoot]), children: [_jsx(ChangeEventHelper, { type: "file", accept: "image/*", ref: fileRef, onChange: handleFileChange, className: classes?.changeEventHelper }), _jsx(PfpIconButton, { disabled: props.readOnly, onClick: captureEnabled ? handleUploadCapture : handleUpload, className: classes?.pfpIconBtn, size: "large", "aria-label": captureEnabled
                        ? t("standalone.file-upload.upload-capture.image")
                        : t("standalone.file-upload.upload"), children: image })] }));
    }
    else {
        throw new Error("Unknown variant");
    }
};
export default React.memo(ImageSelector);
