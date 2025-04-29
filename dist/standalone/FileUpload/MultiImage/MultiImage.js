import React, { useCallback, useEffect, useMemo, useRef, useState, } from "react";
import ImageBox from "./ImageBox";
import GroupBox from "../../GroupBox";
import { Dialog, DialogContent, DialogTitle, Grid, IconButton, Link, styled, Typography, useThemeProps, } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import processImage from "../../../utils/processImage";
import ImageDialogEntry from "./ImageDialogEntry";
import useCCTranslations from "../../../utils/useCCTranslations";
import ImageDots from "./ImageDots";
import combineClassNames from "../../../utils/combineClassNames";
const Root = styled("div", {
    name: "CcMultiImage",
    slot: "root",
})({});
const UploadInput = styled("input", {
    name: "CcMultiImage",
    slot: "uploadInput",
})({
    display: "none",
});
const RootContainer = styled(Grid, {
    name: "CcMultiImage",
    slot: "rootContainer",
})({
    height: "100%",
});
const ImageItem = styled(Grid, { name: "CcMultiImage", slot: "imageItem" })({
    height: "calc(100% - 1rem)",
});
const EditLabel = styled(Typography, {
    name: "CcMultiImage",
    slot: "editLabel",
})({});
export const MultiImageNewIdPrefix = "MultiImage-New-";
const MultiImage = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcMultiImage" });
    const { label, name, editLabel, additionalDialogContent, images, primary, placeholderImage, uploadImage, readOnly, maxImages, capture, convertImagesTo, downscale, onChange, onPrimaryChange, subClasses, onDelete, className, classes, } = props;
    const previewSize = props.previewSize ?? 256;
    const { t } = useCCTranslations();
    const primaryImg = useMemo(() => images.find((img) => img.id === primary) ?? images[0], [images, primary]);
    // images.indexOf(undefined) works and returns -1
    const getPrimaryImageIndex = () => images.indexOf(primaryImg);
    // update primary image ID if it becomes invalid
    useEffect(() => {
        if (!onPrimaryChange)
            return;
        if (!primaryImg) {
            onPrimaryChange(name, null);
            return;
        }
        if (primaryImg.id === primary)
            return;
        onPrimaryChange(name, primaryImg.id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onPrimaryChange, primary, primaryImg]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState(getPrimaryImageIndex);
    const fileUpload = useRef(null);
    const openDialog = useCallback(() => {
        setDialogOpen(true);
    }, []);
    const closeDialog = useCallback(() => {
        setDialogOpen(false);
    }, []);
    const remainingFiles = useMemo(() => maxImages
        ? Math.max(images.length - maxImages, 0)
        : Number.MAX_SAFE_INTEGER, [maxImages, images]);
    const startUpload = useCallback(() => {
        if (readOnly)
            return;
        if (!fileUpload.current)
            return;
        fileUpload.current.click();
    }, [readOnly]);
    const processFile = useCallback((file) => processImage(file, convertImagesTo, downscale), [convertImagesTo, downscale]);
    const processFiles = useCallback(async (files) => {
        const fileArr = Array.from(files);
        return (await Promise.all(fileArr.map(processFile))).map((img, index) => ({
            id: `${MultiImageNewIdPrefix}${new Date().getTime()}-${index}`,
            image: img,
            name: fileArr[index].name,
        }));
    }, [processFile]);
    const handleUploadViaDrop = useCallback(async (files) => {
        if (!onChange)
            return;
        const newImages = await processFiles(files);
        onChange(name, images.concat(newImages));
    }, [processFiles, name, images, onChange]);
    const handlePreviewDrop = useCallback(async (files) => {
        if (!onChange)
            return;
        if (files.length === 0)
            return;
        const newImages = await processFiles(files);
        onChange(name, images.concat(newImages));
        if (onPrimaryChange)
            onPrimaryChange(name, newImages[0].id);
    }, [onChange, name, images, processFiles, onPrimaryChange]);
    const handleUpload = useCallback((evt) => {
        const files = evt.target.files;
        if (!files)
            return;
        void handleUploadViaDrop(files);
    }, [handleUploadViaDrop]);
    useEffect(() => {
        if (currentImage >= images.length) {
            setCurrentImage(images.length - 1);
        }
    }, [currentImage, images]);
    useEffect(() => {
        setCurrentImage(getPrimaryImageIndex);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getPrimaryImageIndex()]);
    const showPrevImage = useCallback(() => {
        setCurrentImage((prev) => (prev === 0 ? prev : prev - 1));
    }, []);
    const showNextImage = useCallback(() => {
        setCurrentImage((prev) => prev + 1);
    }, []);
    const manipulateImages = useCallback((process) => {
        if (!onChange)
            return;
        onChange(name, process(images));
    }, [onChange, name, images]);
    const changePrimary = useCallback((id) => {
        if (!onPrimaryChange)
            return;
        onPrimaryChange(name, id);
    }, [onPrimaryChange, name]);
    return (React.createElement(Root, { className: combineClassNames([className, classes?.root]) },
        React.createElement(GroupBox, { label: label },
            React.createElement(RootContainer, { container: true, spacing: 1, className: classes?.rootContainer },
                React.createElement(ImageItem, { size: 12, className: classes?.imageItem },
                    React.createElement(ImageBox, { image: images[currentImage]?.image ?? placeholderImage ?? uploadImage, fileName: images[currentImage]?.name, onPrevImage: currentImage <= 0 ? undefined : showPrevImage, onNextImage: currentImage < images.length - 1 ? showNextImage : undefined, onFilesDropped: readOnly ? undefined : handlePreviewDrop, onClick: images[currentImage] ? undefined : readOnly ? null : startUpload, classes: subClasses?.imageBox, imageDots: {
                            total: images.length,
                            active: currentImage,
                            setActive: setCurrentImage,
                        }, disableBackground: true })),
                React.createElement(Grid, { container: true, alignContent: "space-between", wrap: "nowrap", spacing: 1, size: 12 },
                    React.createElement(Grid, { size: "grow" },
                        React.createElement(ImageDots, { total: images.length, active: currentImage, setActive: setCurrentImage })),
                    !readOnly && (React.createElement(Grid, null,
                        React.createElement(EditLabel, { component: Link, variant: "body2", onClick: openDialog, href: "#" }, editLabel ?? t("standalone.file-upload.multi-image.edit"))))))),
        React.createElement(UploadInput, { type: "file", multiple: remainingFiles > 1, accept: "image/*", capture: capture, ref: fileUpload, onChange: handleUpload, className: classes?.uploadInput }),
        !readOnly && (React.createElement(React.Fragment, null,
            React.createElement(Dialog, { open: dialogOpen, onClose: closeDialog, maxWidth: "lg", fullWidth: !previewSize },
                React.createElement(DialogTitle, null,
                    React.createElement(Grid, { container: true, justifyContent: "flex-end" },
                        React.createElement(Grid, null,
                            React.createElement(IconButton, { onClick: closeDialog, size: "large" },
                                React.createElement(CloseIcon, null))))),
                React.createElement(DialogContent, null,
                    React.createElement(Grid, { container: true, spacing: 2 },
                        images.map((img, i) => (React.createElement(ImageDialogEntry, { img: img, previewSize: previewSize, isPrimary: img === primaryImg, processFile: processFile, changeImages: manipulateImages, changePrimary: changePrimary, onDelete: onDelete, key: `img-${i}`, classes: subClasses?.imageDialogEntry, subClasses: subClasses?.imageDialogEntrySubClasses }))),
                        !readOnly && remainingFiles > 0 && (React.createElement(Grid, { size: {
                                xs: previewSize ? undefined : 12,
                                md: previewSize ? undefined : 6,
                                lg: previewSize ? undefined : 3,
                            } },
                            React.createElement(ImageBox, { width: previewSize, height: previewSize, image: uploadImage, onClick: startUpload, onFilesDropped: handleUploadViaDrop, classes: subClasses?.imageBox }))),
                        additionalDialogContent?.map((elem, i) => (React.createElement(Grid, { key: `add-${i}`, style: previewSize ? { width: previewSize } : undefined, size: {
                                xs: previewSize ? undefined : 12,
                                md: previewSize ? undefined : 6,
                                lg: previewSize ? undefined : 3,
                            } }, elem))))))))));
};
export default React.memo(MultiImage);
