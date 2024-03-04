import React, { useCallback, useEffect, useImperativeHandle, useRef, useState, } from "react";
import { Box, Button, FormHelperText, Unstable_Grid2 as Grid, Tooltip, Typography, useTheme, } from "@mui/material";
import { AttachFile } from "@mui/icons-material";
import FilePreview, { getFileIconOrDefault } from "./File";
import GroupBox from "../../GroupBox";
import makeStyles from "@mui/styles/makeStyles";
import useCCTranslations from "../../../utils/useCCTranslations";
import isTouchDevice from "../../../utils/isTouchDevice";
import combineClassNames from "../../../utils/combineClassNames";
import getFileExt from "../../../utils/getFileExt";
import matchMime from "../../../utils/matchMime";
import processImage from "../../../utils/processImage";
import useDropZone from "../../../utils/useDropZone";
const useStyles = makeStyles((theme) => ({
    dropzone: {
        border: `2px solid ${theme.palette.primary.main}`,
    },
    formatText: {
        textAlign: "right",
    },
    formatTextModern: {
        color: theme.palette.action.disabled,
    },
    formatIconsModern: {
        color: theme.palette.action.disabled,
    },
    fileInput: {
        display: "none",
    },
    modernUploadLabel: {
        textAlign: "center",
        color: theme.palette.action.disabled,
        display: "block",
        width: "100%",
    },
    modernUploadLabelEmpty: theme.typography.h5,
}), { name: "CcFileUpload" });
const FileUpload = (props, ref) => {
    const { name, convertImagesTo, imageDownscaleOptions, previewImages, previewSize, maxFiles, handleError, accept, acceptLabel, onChange, label, smallLabel, readOnly, onBlur, uploadLabel, allowDuplicates, } = props;
    const theme = useTheme();
    const variant = props.variant ??
        theme.componentsCare?.fileUpload?.generic?.defaultVariant ??
        "classic";
    const classes = useStyles(props);
    const loadInitialFiles = () => (props.files || props.defaultFiles || []).map((meta) => ({
        canBeUploaded: false,
        delete: false,
        ...meta,
    }));
    const [files, setFiles] = useState(loadInitialFiles);
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
    }, [onChange]);
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
            classes,
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
        return (React.createElement(GroupBox, { label: label, smallLabel: smallLabel },
            React.createElement(Grid, { container: true, spacing: 2, alignContent: "space-between", onDragOver: handleDragOver, onDrop: handleDrop, className: combineClassNames([
                    "components-care-dropzone",
                    dragging && classes.dropzone,
                ]) },
                !readOnly && (React.createElement(Grid, { xs: true, key: "upload" },
                    React.createElement(Button, { startIcon: React.createElement(AttachFile, null), variant: "contained", color: "primary", onClick: () => handleUpload(), name: name, onBlur: onBlur }, uploadLabel || t("standalone.file-upload.upload")),
                    React.createElement("input", { type: "file", accept: accept || undefined, multiple: maxFiles ? getRemainingFileCount() > 1 : true, onChange: handleFileChange, className: classes.fileInput, ref: inputRef }))),
                React.createElement(Grid, { xs: 12, key: "files" },
                    React.createElement(Grid, { container: true, spacing: 2, alignContent: "flex-start", alignItems: "flex-start" },
                        files.map((data, index) => data && (React.createElement(FilePreview, { name: data.file.name, downloadLink: "downloadLink" in data.file
                                ? data.file.downloadLink
                                : undefined, key: `${index}-${data.file.name}`, size: previewSize, preview: previewImages ? data.preview : undefined, disabled: data.delete || false, onRemove: readOnly || data.preventDelete
                                ? undefined
                                : () => removeFile(data), variant: "box" }))),
                        readOnly && files.length === 0 && (React.createElement(Grid, null,
                            React.createElement(Typography, null, t("standalone.file-upload.no-files")))))),
                !readOnly && (React.createElement(Grid, { xs: 12, key: "info" },
                    React.createElement(FormHelperText, { className: classes.formatText },
                        "(",
                        t("standalone.file-upload.formats"),
                        ":",
                        " ",
                        acceptLabel ||
                            accept ||
                            t("standalone.file-upload.format.any"),
                        ")"))))));
    }
    else if (variant === "modern") {
        const acceptFiles = accept ? accept.split(",") : [];
        return (React.createElement(GroupBox, { label: label, smallLabel: smallLabel },
            React.createElement(Grid, { container: true, spacing: 2, alignContent: "space-between", onDragOver: handleDragOver, onDrop: handleDrop, onClick: () => handleUpload(), className: combineClassNames([
                    "components-care-dropzone",
                    dragging && classes.dropzone,
                ]) },
                !readOnly && (React.createElement(Grid, { xs: true, key: "upload" },
                    React.createElement("span", { className: combineClassNames([
                            classes.modernUploadLabel,
                            files.length === 0 && classes.modernUploadLabelEmpty,
                        ]) }, uploadLabel || t("standalone.file-upload.upload-modern")),
                    React.createElement("input", { type: "file", accept: accept || undefined, multiple: maxFiles ? getRemainingFileCount() > 1 : true, onChange: handleFileChange, className: classes.fileInput, ref: inputRef }))),
                files.length > 0 && (React.createElement(Grid, { xs: 12, key: "files" },
                    React.createElement(Box, { mx: 1 },
                        React.createElement(Grid, { container: true, spacing: 1, alignContent: "flex-start", alignItems: "flex-start" }, files.map((data, index) => data && (React.createElement(FilePreview, { name: data.file.name, downloadLink: "downloadLink" in data.file
                                ? data.file.downloadLink
                                : undefined, key: `${index}-${data.file.name}`, size: previewSize, preview: previewImages ? data.preview : undefined, disabled: data.delete || false, onRemove: readOnly || data.preventDelete
                                ? undefined
                                : () => removeFile(data), variant: "list" }))))))),
                readOnly && files.length === 0 && (React.createElement(Grid, { xs: 12, key: "no-files" },
                    React.createElement(Typography, null, t("standalone.file-upload.no-files")))),
                !readOnly && (React.createElement(Grid, { xs: 12, key: "info", container: true, wrap: "nowrap", spacing: 1 },
                    React.createElement(Grid, { xs: true },
                        React.createElement(Typography, { align: "right", className: classes.formatTextModern },
                            t("standalone.file-upload.formats-modern"),
                            " ",
                            acceptFiles.length == 0 &&
                                t("standalone.file-upload.format.any"))),
                    acceptFiles.map((entry, idx) => (React.createElement(Grid, { className: classes.formatIconsModern, key: idx.toString(16) },
                        React.createElement(Tooltip, { title: acceptLabel || accept || "" },
                            React.createElement("span", null, React.createElement(getFileIconOrDefault(entry))))))))))));
    }
    else {
        throw new Error("Invalid variant prop passed");
    }
};
export default React.forwardRef(FileUpload);
