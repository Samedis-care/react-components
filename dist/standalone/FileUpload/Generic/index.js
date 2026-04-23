import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useEffect, useImperativeHandle, useRef, } from "react";
import { Box, Button, FormHelperText, styled, Tooltip, Typography, Grid, useThemeProps, } from "@mui/material";
import { AttachFile } from "@mui/icons-material";
import FilePreview, { getFileIconOrDefault } from "./File";
import processImage from "../../../utils/processImage";
import GroupBox from "../../GroupBox";
import useCCTranslations from "../../../utils/useCCTranslations";
import isTouchDevice from "../../../utils/isTouchDevice";
import combineClassNames from "../../../utils/combineClassNames";
import getFileExt from "../../../utils/getFileExt";
import matchMime from "../../../utils/matchMime";
import useDropZone from "../../../utils/useDropZone";
import useRefState from "../../../utils/useRefState";
const StyledGroupBox = styled(GroupBox, { name: "CcFileUpload", slot: "root" })({});
const Dropzone = styled(Grid, { name: "CcFileUpload", slot: "dropzone" })(({ theme }) => ({
    "&.Mui-active": {
        border: `2px solid ${theme.palette.primary.main}`,
    },
}));
const FormatTextModern = styled(Typography, {
    name: "CcFileUpload",
    slot: "formatTextModern",
})(({ theme }) => ({
    color: theme.palette.action.disabled,
}));
const FormatIconsModern = styled(Grid, {
    name: "CcFileUpload",
    slot: "formatIconsModern",
})(({ theme }) => ({
    color: theme.palette.action.disabled,
}));
export const FileInput = styled("input", {
    name: "CcFileUpload",
    slot: "fileInput",
})({
    display: "none",
});
const FormatText = styled(FormHelperText, {
    name: "CcFileUpload",
    slot: "formatText",
})({
    textAlign: "right",
});
const ModernUploadLabel = styled("span", {
    name: "CcFileUpload",
    slot: "modernUploadLabel",
})(({ theme }) => ({
    textAlign: "center",
    color: theme.palette.action.disabled,
    display: "block",
    width: "100%",
    "&.CcFileUpload-modernUploadLabel-empty": theme.typography.h5,
}));
const FileUpload = (inProps, ref) => {
    const props = useThemeProps({ props: inProps, name: "CcFileUpload" });
    const { name, convertImagesTo, imageDownscaleOptions, previewImages, previewSize, maxFiles, handleError, accept, acceptLabel, onChange, label, smallLabel, readOnly, onBlur, uploadLabel, allowDuplicates, className, classes, } = props;
    const variant = props.variant ?? "classic";
    const loadInitialFiles = () => (props.files || props.defaultFiles || []).map((meta) => ({
        canBeUploaded: false,
        delete: false,
        ...meta,
    }));
    const { state: files, set: setFiles } = useRefState(loadInitialFiles);
    const inputRef = useRef(null);
    const { t } = useCCTranslations();
    const getRemainingFileCount = useCallback(() => {
        if (!maxFiles)
            throw new Error("max files isn't set, this function shouldn't be called");
        return maxFiles - files.filter((file) => !file.delete).length;
    }, [maxFiles, files]);
    const processFiles = useCallback(async (files) => {
        const processImages = !!(convertImagesTo ||
            imageDownscaleOptions ||
            previewImages);
        if (maxFiles) {
            if (files.length > getRemainingFileCount()) {
                handleError("files.selector.too-many", t("standalone.file-upload.error.too-many"));
                return;
            }
        }
        const newFiles = [];
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            // fix for mobile safari image capture. name is always image.jpg
            if (!allowDuplicates && isTouchDevice() && file.name === "image.jpg") {
                file = new File([file], `image-${new Date()
                    .toISOString()
                    .replace(/[:.T]/g, "-")
                    .replace(/Z/g, "")}.jpg`, {
                    type: file.type,
                    lastModified: file.lastModified,
                });
            }
            const isImage = file.type.startsWith("image/");
            if (isImage && processImages) {
                newFiles.push({
                    file,
                    preview: await processImage(file, convertImagesTo, imageDownscaleOptions),
                    canBeUploaded: true,
                    delete: false,
                });
            }
            else {
                newFiles.push({ file, canBeUploaded: true, delete: false });
            }
        }
        if (accept) {
            const allowedTypes = accept.split(",").map((type) => type.trim());
            const allowedFileExt = allowedTypes
                .filter((type) => type.startsWith("."))
                .map((type) => type.substring(1).toLowerCase());
            const allowedMimes = allowedTypes.filter((type) => type.includes("/"));
            if (newFiles.find((file) => !allowedMimes
                .map((allowed) => matchMime(allowed, file.file.type))
                .includes(true) &&
                !allowedFileExt.includes(getFileExt(file.file.name).toLowerCase()))) {
                handleError("files.type.invalid", t("standalone.file-upload.error.invalid-type"));
                return;
            }
        }
        setFiles((prev) => {
            const newValue = allowDuplicates
                ? [...prev, ...newFiles]
                : [
                    ...prev.filter(
                    // check for file name duplicates and replace
                    (file) => !newFiles
                        .map((newFile) => newFile.file.name)
                        .includes(file.file.name)),
                    ...newFiles,
                ];
            if (onChange)
                onChange(newValue);
            return newValue;
        });
    }, [
        accept,
        allowDuplicates,
        convertImagesTo,
        getRemainingFileCount,
        handleError,
        imageDownscaleOptions,
        maxFiles,
        onChange,
        previewImages,
        setFiles,
        t,
    ]);
    const handleUpload = useCallback((capture) => {
        const elem = inputRef.current;
        if (!elem)
            return;
        const prevAccept = elem.accept;
        const prevCapture = elem.capture;
        if (capture) {
            elem.accept = capture.type + "/*";
            elem.capture = capture.source;
        }
        if (maxFiles) {
            if (getRemainingFileCount() === 0) {
                handleError("files.selector.limit-reached", t("standalone.file-upload.error.limit-reached"));
                return;
            }
        }
        elem.click();
        if (capture) {
            if (prevCapture)
                elem.capture = prevCapture;
            else
                elem.removeAttribute("capture");
            if (prevAccept)
                elem.accept = prevAccept;
            else
                elem.removeAttribute("accept");
        }
    }, [maxFiles, getRemainingFileCount, handleError, t]);
    const handleFileChange = useCallback(async (evt) => {
        const files = evt.currentTarget.files;
        if (!files)
            return;
        return processFiles(files);
    }, [processFiles]);
    const removeFile = useCallback((file) => {
        if ("downloadLink" in file.file) {
            file.delete = true;
            setFiles((prev) => {
                const newValue = [...prev];
                if (onChange)
                    onChange(newValue);
                return newValue;
            });
            return;
        }
        setFiles((prev) => {
            const newValue = prev.filter((f) => f !== file);
            if (onChange)
                onChange(newValue);
            return newValue;
        });
    }, [onChange, setFiles]);
    const { handleDrop, handleDragOver, dragging } = useDropZone(readOnly ? undefined : processFiles);
    // update files if necessary
    useEffect(() => {
        setFiles(loadInitialFiles);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.files]);
    useImperativeHandle(ref, () => ({
        addFile: (file) => {
            return processFiles([file]);
        },
        openUploadDialog: handleUpload,
    }));
    if (typeof variant !== "string") {
        return React.createElement(variant, {
            ...props,
            handleDragOver,
            handleDrop,
            dragging,
            handleUpload,
            getRemainingFileCount,
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            handleFileChange,
            inputRef,
            files,
            removeFile,
        });
    }
    else if (variant === "classic") {
        return (_jsx(StyledGroupBox, { label: label, smallLabel: smallLabel, className: combineClassNames([className, classes?.root]), children: _jsxs(Dropzone, { container: true, spacing: 2, sx: { alignContent: "space-between" }, onDragOver: handleDragOver, onDrop: handleDrop, className: combineClassNames([
                    "components-care-dropzone",
                    classes?.dropzone,
                    dragging && "Mui-active",
                ]), children: [!readOnly && (_jsxs(Grid, { size: "grow", children: [_jsx(Button, { startIcon: _jsx(AttachFile, {}), variant: "contained", color: "primary", onClick: () => handleUpload(), name: name, onBlur: onBlur, children: uploadLabel || t("standalone.file-upload.upload") }), _jsx(FileInput, { type: "file", accept: accept || undefined, multiple: maxFiles ? getRemainingFileCount() > 1 : true, onChange: handleFileChange, className: classes?.fileInput, ref: inputRef })] }, "upload")), _jsx(Grid, { size: 12, children: _jsxs(Grid, { container: true, spacing: 2, sx: { alignContent: "flex-start", alignItems: "flex-start" }, children: [files.map((data, index) => data && (_jsx(FilePreview, { name: data.file.name, mimeType: data.file.type, downloadLink: "downloadLink" in data.file
                                        ? data.file.downloadLink
                                        : undefined, size: previewSize, preview: previewImages ? data.preview : undefined, disabled: data.delete || false, onRemove: readOnly || data.preventDelete
                                        ? undefined
                                        : () => removeFile(data), variant: "box" }, `${index}-${data.file.name}`))), readOnly && files.length === 0 && (_jsx(Grid, { children: _jsx(Typography, { children: t("standalone.file-upload.no-files") }) }))] }) }, "files"), !readOnly && (_jsx(Grid, { size: 12, children: _jsxs(FormatText, { className: classes?.formatText, children: ["(", t("standalone.file-upload.formats"), ":", " ", acceptLabel ||
                                    accept ||
                                    t("standalone.file-upload.format.any"), ")"] }) }, "info"))] }) }));
    }
    else if (variant === "modern") {
        const acceptFiles = accept ? accept.split(",") : [];
        return (_jsx(StyledGroupBox, { label: label, smallLabel: smallLabel, className: combineClassNames([className, classes?.root]), children: _jsxs(Grid, { container: true, spacing: 2, sx: { alignContent: "space-between" }, onDragOver: handleDragOver, onDrop: handleDrop, onClick: () => handleUpload(), className: combineClassNames([
                    classes?.dropzone,
                    "components-care-dropzone",
                    dragging && "Mui-active",
                ]), children: [!readOnly && (_jsxs(Grid, { size: "grow", children: [_jsx(ModernUploadLabel, { className: combineClassNames([
                                    classes?.modernUploadLabel,
                                    files.length === 0 && "CcFileUpload-modernUploadLabel-empty",
                                ]), children: uploadLabel || t("standalone.file-upload.upload-modern") }), _jsx(FileInput, { type: "file", accept: accept || undefined, multiple: maxFiles ? getRemainingFileCount() > 1 : true, onChange: handleFileChange, className: classes?.fileInput, ref: inputRef })] }, "upload")), files.length > 0 && (_jsx(Grid, { size: 12, children: _jsx(Box, { sx: { mx: 1 }, children: _jsx(Grid, { container: true, spacing: 1, sx: { alignContent: "flex-start", alignItems: "flex-start" }, children: files.map((data, index) => data && (_jsx(FilePreview, { name: data.file.name, mimeType: data.file.type, downloadLink: "downloadLink" in data.file
                                        ? data.file.downloadLink
                                        : undefined, size: previewSize, preview: previewImages ? data.preview : undefined, disabled: data.delete || false, onRemove: readOnly || data.preventDelete
                                        ? undefined
                                        : () => removeFile(data), variant: "list" }, `${index}-${data.file.name}`))) }) }) }, "files")), readOnly && files.length === 0 && (_jsx(Grid, { size: 12, children: _jsx(Typography, { children: t("standalone.file-upload.no-files") }) }, "no-files")), !readOnly && (_jsxs(Grid, { container: true, wrap: "nowrap", spacing: 1, size: 12, children: [_jsx(Grid, { size: "grow", children: _jsxs(FormatTextModern, { align: "right", className: classes?.formatTextModern, children: [t("standalone.file-upload.formats-modern"), " ", acceptFiles.length == 0 &&
                                            t("standalone.file-upload.format.any")] }) }), acceptFiles.map((entry, idx) => (_jsx(FormatIconsModern, { className: classes?.formatIconsModern, children: _jsx(Tooltip, { title: acceptLabel || accept || "", children: _jsx("span", { children: React.createElement(getFileIconOrDefault(entry, entry)) }) }) }, idx.toString(16))))] }, "info"))] }) }));
    }
    else {
        throw new Error("Invalid variant prop passed");
    }
};
export default React.forwardRef(FileUpload);
