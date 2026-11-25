import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useCallback, useEffect, useMemo, useRef, useState, } from "react";
import ImageBox from "./ImageBox";
import GroupBox from "../../GroupBox";
import { ButtonBase, Dialog, DialogContent, DialogTitle, Grid, IconButton, Link, styled, Typography, useThemeProps, } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import processImage from "../../../utils/processImage";
import ImageDialogEntry from "./ImageDialogEntry";
import useCCTranslations from "../../../utils/useCCTranslations";
import ImageDots from "./ImageDots";
import combineClassNames from "../../../utils/combineClassNames";
import getCanImageCapture from "../../../utils/getCanImageCapture";
import useImageError from "../useImageError";
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
const TileButton = styled(ButtonBase, {
    name: "CcMultiImage",
    slot: "tileButton",
})(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
    // a ring over the ImageBox inside: an outline of the button is painted under the ImageBox,
    // and one outside the button is cut off in the first row by the scrolling dialog content
    "&.Mui-focusVisible::after": {
        content: '""',
        position: "absolute",
        inset: 0,
        border: `2px solid ${theme.palette.primary.main}`,
        borderRadius: "inherit",
        pointerEvents: "none",
    },
}));
/**
 * The edit dialog's images as a list (role list, the entries are its items), so a screen
 * reader says how many there are. It draws no box: the entries stay items of the dialog's
 * Grid container, and the add and camera tiles, which are not in the list, still follow the
 * last image in the same row.
 */
const DialogImageList = styled("div")({
    display: "contents",
});
/**
 * Prefix of the id of an image the user added. The rest of the id is the time it was added
 * and a number, which keep it unique on the page.
 */
export const MultiImageNewIdPrefix = "MultiImage-New-";
// numbers the added images, so that two added in the same millisecond get different ids
let addedImageCount = 0;
const MultiImage = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcMultiImage" });
    const { label, name, editLabel, additionalDialogContent, dialogMessage, onDialogOpenChange, images, primary, placeholderImage, uploadImage, captureImage, readOnly, busy, slotProps, maxImages, capture, convertImagesTo, downscale, onChange, onPrimaryChange, subClasses, onDelete, onError, disableRotation, className, classes, } = props;
    const previewSize = props.previewSize ?? 256;
    const { t } = useCCTranslations();
    const handleImageError = useImageError("MultiImage.processFiles", onError);
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
    const openDialog = useCallback((evt) => {
        // the edit label is an anchor for looks and keyboard focus only. Letting
        // its href through navigates to "#", which pushes a history entry with a
        // null state and breaks every FrameworkHistory.block guard on the page.
        evt.preventDefault();
        setDialogOpen(true);
    }, []);
    const closeDialog = useCallback(() => {
        setDialogOpen(false);
    }, []);
    // read-only, the dialog is not rendered
    const dialogShown = dialogOpen && !readOnly;
    const onDialogOpenChangeRef = useRef(onDialogOpenChange);
    onDialogOpenChangeRef.current = onDialogOpenChange;
    useEffect(() => {
        if (!dialogShown)
            return;
        onDialogOpenChangeRef.current?.(true);
        return () => onDialogOpenChangeRef.current?.(false);
    }, [dialogShown]);
    const remainingFiles = useMemo(() => maxImages
        ? Math.max(images.length - maxImages, 0)
        : Number.MAX_SAFE_INTEGER, [maxImages, images]);
    const startUpload = useCallback(() => {
        if (readOnly)
            return;
        if (!fileUpload.current)
            return;
        fileUpload.current.removeAttribute("capture");
        fileUpload.current.click();
    }, [readOnly]);
    const enableCapture = !!capture && getCanImageCapture();
    const startUploadCapture = useCallback(() => {
        if (readOnly)
            return;
        if (!fileUpload.current)
            return;
        if (capture)
            fileUpload.current.setAttribute("capture", capture);
        fileUpload.current.click();
    }, [readOnly, capture]);
    const processFile = useCallback((file) => processImage(file, convertImagesTo, downscale), [convertImagesTo, downscale]);
    const processFiles = useCallback(async (files) => {
        const fileArr = Array.from(files);
        return (await Promise.all(fileArr.map(processFile))).map((img, index) => ({
            id: `${MultiImageNewIdPrefix}${new Date().getTime()}-${addedImageCount++}`,
            image: img,
            name: fileArr[index].name,
        }));
    }, [processFile]);
    // The props of the latest render. A change that finishes after an await (a pick being
    // processed, a delete confirmation) is applied to the images as they are by then and
    // reported to the handlers passed last, so changes that overlap keep each other.
    const latest = useRef({ name, images, onChange, onPrimaryChange });
    latest.current = { name, images, onChange, onPrimaryChange };
    const manipulateImages = useCallback((process) => {
        const current = latest.current;
        if (!current.onChange)
            return;
        const newImages = process(current.images);
        // e.g. a replacement that finished after its image was removed
        if (newImages === current.images)
            return;
        current.onChange(current.name, newImages);
    }, []);
    const handleUploadViaDrop = useCallback(async (files) => {
        if (!latest.current.onChange)
            return;
        let newImages;
        try {
            newImages = await processFiles(files);
        }
        catch (e) {
            // one of the images couldn't be read or the browser couldn't decode it
            handleImageError(e);
            return;
        }
        manipulateImages((current) => current.concat(newImages));
    }, [processFiles, manipulateImages, handleImageError]);
    const handlePreviewDrop = useCallback(async (files) => {
        if (!latest.current.onChange)
            return;
        if (files.length === 0)
            return;
        let newImages;
        try {
            newImages = await processFiles(files);
        }
        catch (e) {
            // one of the images couldn't be read or the browser couldn't decode it
            handleImageError(e);
            return;
        }
        manipulateImages((current) => current.concat(newImages));
        const current = latest.current;
        current.onPrimaryChange?.(current.name, newImages[0].id);
    }, [processFiles, manipulateImages, handleImageError]);
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
    const changePrimary = useCallback((id) => {
        if (!onPrimaryChange)
            return;
        onPrimaryChange(name, id);
    }, [onPrimaryChange, name]);
    return (_jsxs(Root, { className: combineClassNames([className, classes?.root]), children: [_jsx(GroupBox, { ...slotProps?.groupBox, "aria-busy": busy || slotProps?.groupBox?.["aria-busy"], label: label, children: _jsxs(RootContainer, { container: true, spacing: 1, className: classes?.rootContainer, children: [_jsx(ImageItem, { size: 12, className: classes?.imageItem, children: _jsx(ImageBox, { image: images[currentImage]?.image ?? placeholderImage ?? uploadImage, fileName: images[currentImage]?.name, onPrevImage: currentImage <= 0 ? undefined : showPrevImage, onNextImage: currentImage < images.length - 1 ? showNextImage : undefined, onFilesDropped: readOnly ? undefined : handlePreviewDrop, onClick: images[currentImage] ? undefined : readOnly ? null : startUpload, classes: subClasses?.imageBox, disableRotation: disableRotation, imageDots: {
                                    total: images.length,
                                    active: currentImage,
                                    setActive: setCurrentImage,
                                }, disableBackground: true }) }), _jsxs(Grid, { container: true, sx: { alignContent: "space-between" }, wrap: "nowrap", spacing: 1, size: 12, children: [_jsx(Grid, { size: "grow", children: _jsx(ImageDots, { total: images.length, active: currentImage, setActive: setCurrentImage }) }), !readOnly && (_jsx(Grid, { children: _jsx(EditLabel, { component: Link, variant: "body2", onClick: openDialog, href: "#", children: editLabel ?? t("standalone.file-upload.multi-image.edit") }) }))] })] }) }), _jsx(UploadInput, { type: "file", multiple: remainingFiles > 1, accept: "image/*", capture: capture, ref: fileUpload, onChange: handleUpload, className: classes?.uploadInput }), !readOnly && (_jsx(_Fragment, { children: _jsxs(Dialog, { open: dialogOpen, onClose: closeDialog, maxWidth: "lg", fullWidth: !previewSize, children: [_jsx(DialogTitle, { children: _jsx(Grid, { container: true, sx: { justifyContent: "flex-end" }, children: _jsx(Grid, { children: _jsx(IconButton, { onClick: closeDialog, size: "large", "aria-label": t("standalone.file-upload.close"), children: _jsx(CloseIcon, {}) }) }) }) }), _jsxs(DialogContent, { children: [dialogMessage, _jsxs(Grid, { container: true, spacing: 2, children: [images.length > 0 && (_jsx(DialogImageList, { role: "list", children: images.map((img, i) => (_jsx(ImageDialogEntry, { img: img, previewSize: previewSize, isPrimary: img === primaryImg, processFile: processFile, onImageError: handleImageError, changeImages: manipulateImages, changePrimary: changePrimary, onDelete: onDelete, disableRotation: disableRotation, classes: subClasses?.imageDialogEntry, subClasses: subClasses?.imageDialogEntrySubClasses }, `img-${i}`))) })), !readOnly && remainingFiles > 0 && (_jsxs(_Fragment, { children: [_jsx(Grid, { size: {
                                                        xs: previewSize ? undefined : 12,
                                                        md: previewSize ? undefined : 6,
                                                        lg: previewSize ? undefined : 3,
                                                    }, children: _jsx(TileButton
                                                    // it holds the ImageBox's divs
                                                    , { 
                                                        // it holds the ImageBox's divs
                                                        component: "div", onClick: startUpload, "aria-label": t("standalone.file-upload.multi-image.add"), className: classes?.tileButton, children: _jsx(ImageBox, { width: previewSize, height: previewSize, image: uploadImage, onClick: null, onFilesDropped: handleUploadViaDrop, classes: subClasses?.imageBox }) }) }), enableCapture && (_jsx(Grid, { size: {
                                                        xs: previewSize ? undefined : 12,
                                                        md: previewSize ? undefined : 6,
                                                        lg: previewSize ? undefined : 3,
                                                    }, children: _jsx(TileButton, { component: "div", onClick: startUploadCapture, "aria-label": t("standalone.file-upload.upload-capture.image"), className: classes?.tileButton, children: _jsx(ImageBox, { width: previewSize, height: previewSize, image: captureImage, onClick: null, onFilesDropped: handleUploadViaDrop, classes: subClasses?.imageBox }) }) }))] })), additionalDialogContent?.map((elem, i) => (_jsx(Grid, { style: previewSize ? { width: previewSize } : undefined, size: {
                                                xs: previewSize ? undefined : 12,
                                                md: previewSize ? undefined : 6,
                                                lg: previewSize ? undefined : 3,
                                            }, children: elem }, `add-${i}`)))] })] })] }) }))] }));
};
export default React.memo(MultiImage);
