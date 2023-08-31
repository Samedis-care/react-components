import React, { useCallback, useRef } from "react";
import { Box, Button, Grid, IconButton, Tooltip, Typography, useTheme, } from "@mui/material";
import { AttachFile, Person } from "@mui/icons-material";
import { combineClassNames, processImage } from "../../../utils";
import makeStyles from "@mui/styles/makeStyles";
import GroupBox from "../../GroupBox";
import useCCTranslations from "../../../utils/useCCTranslations";
import { ImageFileIcon } from "../FileIcons";
const useStyles = makeStyles((theme) => ({
    root: {
        width: `calc(100% - ${theme.spacing(2)})`,
        height: `calc(100% - ${theme.spacing(2)})`,
        marginTop: theme.spacing(2),
    },
    rootModern: {
        cursor: "pointer",
        height: "100%",
    },
    imgWrapper: {
        maxHeight: "100%",
    },
    preview: {
        objectFit: "contain",
        display: "block",
        width: `calc(100% - ${theme.spacing(2)})`,
        height: `calc(100% - ${theme.spacing(2)})`,
    },
    previewModern: {
        objectFit: "contain",
        display: "block",
        width: "100%",
        height: "100%",
    },
    modernUploadLabel: {
        color: theme.palette.action.disabled,
    },
    modernFormatsLabel: {
        color: theme.palette.action.disabled,
    },
    modernFormatIcon: {
        color: theme.palette.action.disabled,
    },
    modernFullHeight: {
        height: "100%",
    },
    clickablePreview: {
        cursor: "pointer",
    },
    changeEventHelper: {
        display: "none",
    },
    pfpRoot: {
        height: "100%",
    },
    pfpIconBtn: {
        width: "100%",
        height: "100%",
        margin: 2,
        padding: 0,
    },
    pfpImg: {
        width: "100%",
        height: "100%",
        border: `1px lightgray solid`,
        borderRadius: "50%",
        boxShadow: theme.shadows[4],
        textOverflow: "ellipsis",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
    },
}), { name: "CcImageSelector" });
const ImageSelector = (props) => {
    const { convertImagesTo, downscale, name, value, readOnly, capture, onChange, } = props;
    const theme = useTheme();
    const variant = props.variant ??
        theme.componentsCare?.fileUpload?.image?.defaultVariant ??
        "normal";
    const classes = useStyles(props);
    const fileRef = useRef(null);
    const { t } = useCCTranslations();
    const processFile = useCallback(async (file) => {
        if (!onChange)
            return;
        onChange(name, await processImage(file, convertImagesTo, downscale));
    }, [name, onChange, convertImagesTo, downscale]);
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
    // render component
    if (variant === "normal") {
        return (React.createElement(GroupBox, { label: props.label, smallLabel: props.smallLabel },
            React.createElement(Grid, { container: true, spacing: 2, direction: "column", alignContent: "flex-start", alignItems: "stretch", justifyContent: "center", wrap: "nowrap", className: classes.root, onDrop: handleDrop, onDragOver: handleDragOver },
                !props.readOnly && (React.createElement(Grid, { item: true, key: "upload" },
                    React.createElement(Button, { startIcon: React.createElement(AttachFile, null), variant: "contained", color: "primary", name: props.name, onClick: handleUpload, onBlur: props.onBlur }, props.uploadLabel || t("standalone.file-upload.upload")),
                    React.createElement("input", { type: "file", accept: "image/*", ref: fileRef, onChange: handleFileChange, className: classes.changeEventHelper }))),
                React.createElement(Grid, { item: true, xs: true, key: "image", className: classes.imgWrapper }, value && (React.createElement("img", { src: value, alt: props.alt, className: classes.preview }))))));
    }
    else if (variant === "modern") {
        return (React.createElement(GroupBox, { label: props.label, smallLabel: props.smallLabel },
            React.createElement(Grid, { container: true, spacing: 0, direction: "column", alignContent: "flex-start", alignItems: "stretch", justifyContent: "center", wrap: "nowrap", className: classes.rootModern, onDrop: handleDrop, onDragOver: handleDragOver },
                !props.readOnly && (React.createElement("input", { type: "file", accept: "image/*", ref: fileRef, onChange: handleFileChange, className: classes.changeEventHelper })),
                React.createElement(Grid, { item: true, xs: true, key: "image", className: classes.imgWrapper, onBlur: props.onBlur, "data-name": props.name }, value ? (React.createElement(Tooltip, { title: props.uploadLabel ??
                        t("standalone.file-upload.upload-modern") ??
                        "" },
                    React.createElement("img", { src: value, alt: props.alt, onClick: handleUpload, className: combineClassNames([
                            classes.previewModern,
                            classes.clickablePreview,
                        ]) }))) : (React.createElement(Box, { px: 2, className: classes.modernFullHeight },
                    React.createElement(Grid, { container: true, onClick: handleUpload, direction: "column", spacing: 0, className: classes.modernFullHeight },
                        React.createElement(Grid, { item: true, xs: true, container: true, direction: "column", justifyContent: "space-around", wrap: "nowrap" },
                            React.createElement(Grid, { item: true },
                                React.createElement(Typography, { component: "h1", variant: "h5", className: classes.modernUploadLabel, align: "center" }, props.uploadLabel ??
                                    t("standalone.file-upload.upload-modern") ??
                                    ""))),
                        React.createElement(Grid, { item: true },
                            React.createElement(Grid, { container: true, wrap: "nowrap", spacing: 0, justifyContent: "space-between" },
                                React.createElement(Grid, { item: true },
                                    React.createElement(Typography, { className: classes.modernFormatsLabel }, props.formatsLabel ??
                                        t("standalone.file-upload.formats-modern") ??
                                        "")),
                                React.createElement(Grid, { item: true },
                                    React.createElement(ImageFileIcon, { className: classes.modernFormatIcon })))))))))));
    }
    else if (variant === "profile_picture") {
        const image = value ? (React.createElement("img", { src: value, className: classes.pfpImg, alt: props.label })) : (React.createElement(Person, { className: classes.pfpImg }));
        return (React.createElement("div", { onDrop: handleDrop, onDragOver: handleDragOver, className: classes.pfpRoot },
            React.createElement("input", { type: "file", accept: "image/*", ref: fileRef, onChange: handleFileChange, className: classes.changeEventHelper }),
            React.createElement(IconButton, { disabled: props.readOnly, onClick: handleUpload, classes: {
                    root: classes.pfpIconBtn,
                }, size: "large" }, image)));
    }
    else {
        throw new Error("Unknown variant");
    }
};
export default React.memo(ImageSelector);
