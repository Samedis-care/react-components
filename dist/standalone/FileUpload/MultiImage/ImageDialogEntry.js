import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useCallback, useId, useRef } from "react";
import ImageBox from "./ImageBox";
import { ButtonBase, Grid, IconButton, styled, Typography, useThemeProps, } from "@mui/material";
import { Delete as DeleteIcon, Star as StarredIcon, StarOutlined as NotStarredIcon, SwapHoriz as ReplaceIcon, } from "@mui/icons-material";
import useCCTranslations from "../../../utils/useCCTranslations";
import combineClassNames from "../../../utils/combineClassNames";
const Root = styled(Grid, { name: "CcImageDialogEntry", slot: "root" })({});
const Actions = styled("div", {
    name: "CcImageDialogEntry",
    slot: "actions",
})(({ theme }) => ({
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(1),
    // as wide as the image: adds no width of its own to the entry, wraps instead
    width: 0,
    minWidth: "100%",
    // MUI shows keyboard focus on these buttons as a faint ripple at most
    "& .Mui-focusVisible": {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: 2,
    },
}));
const PrimaryButton = styled(ButtonBase, {
    name: "CcImageDialogEntry",
    slot: "primaryButton",
})(({ theme }) => ({
    marginRight: "auto",
    padding: theme.spacing(0.5),
    borderRadius: theme.shape.borderRadius,
    // the primary image's button does nothing
    "&[aria-pressed='true']": {
        cursor: "default",
    },
}));
const primaryLabelStyles = ({ theme }) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: theme.spacing(1),
});
const MakePrimary = styled("span", {
    name: "CcImageDialogEntry",
    slot: "makePrimary",
})(primaryLabelStyles);
const IsPrimary = styled("span", {
    name: "CcImageDialogEntry",
    slot: "isPrimary",
})(primaryLabelStyles);
/**
 * One image in MultiImage's edit dialog: the image (a click opens the full-screen view, a
 * file dropped onto it replaces it), and under it a make-primary toggle button
 * (`aria-pressed`) and, unless the image is readOnly, Replace (opens the file picker) and
 * Remove. Each button is named after the image's file name. Internal to MultiImage.
 */
const ImageDialogEntry = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcImageDialogEntry" });
    const { previewSize, img, isPrimary, changeImages, changePrimary, processFile, onImageError, subClasses, onDelete, disableRotation, className, classes, } = props;
    const { t } = useCCTranslations();
    const id = useId();
    // each action is named after the image it acts on: its own label, then the file name
    const nameId = `${id}-name`;
    const primaryId = `${id}-primary`;
    const replaceId = `${id}-replace`;
    const removeId = `${id}-remove`;
    const replaceInput = useRef(null);
    const setPrimary = useCallback(() => {
        changePrimary(img.id);
    }, [changePrimary, img]);
    const removeImage = useCallback(async () => {
        if (onDelete) {
            // check for confirmation
            if (!(await onDelete(img))) {
                // if user doesn't confirm, abort
                return;
            }
        }
        changeImages((images) => {
            return images.filter((image) => image !== img);
        });
    }, [onDelete, changeImages, img]);
    const replaceWith = useCallback(async (file) => {
        let imageData;
        try {
            imageData = await processFile(file);
        }
        catch (e) {
            // the image couldn't be read or the browser couldn't decode it
            onImageError(e);
            return;
        }
        changeImages((images) => images.map((image) => image === img ? { ...image, image: imageData } : image));
    }, [changeImages, img, processFile, onImageError]);
    const replaceImage = useCallback(async (files) => {
        const file = files.item(0);
        if (!file)
            return;
        await replaceWith(file);
    }, [replaceWith]);
    const pickReplacement = useCallback(() => {
        replaceInput.current?.click();
    }, []);
    const handleReplacementPicked = useCallback((evt) => {
        const file = evt.currentTarget.files?.[0];
        // browsers fire no change event for a selection equal to the input's value
        evt.currentTarget.value = "";
        if (!file)
            return;
        void replaceWith(file);
    }, [replaceWith]);
    // only the label's slot follows the state: the button stays, and keeps focus when its
    // image becomes primary
    const PrimaryLabel = isPrimary ? IsPrimary : MakePrimary;
    return (_jsxs(Root, { size: previewSize ? undefined : { xs: 12, md: 6, lg: 3 }, className: combineClassNames([className, classes?.root]), children: [_jsx("div", { children: _jsx(ImageBox, { fileName: img.name, width: previewSize, height: previewSize, image: img.image, onFilesDropped: img.readOnly ? undefined : replaceImage, classes: subClasses?.imageBox, disableRotation: disableRotation }) }), _jsxs(Actions, { className: classes?.actions, children: [_jsx(PrimaryButton, { id: primaryId, "aria-labelledby": `${primaryId} ${nameId}`, "aria-pressed": isPrimary, onClick: isPrimary ? undefined : setPrimary, className: classes?.primaryButton, children: _jsxs(PrimaryLabel, { className: isPrimary ? classes?.isPrimary : classes?.makePrimary, children: [isPrimary ? _jsx(StarredIcon, { color: "primary" }) : _jsx(NotStarredIcon, {}), _jsx(Typography, { component: "span", children: t("standalone.file-upload.multi-image.primary") })] }) }), !img.readOnly && (_jsxs(_Fragment, { children: [_jsx(IconButton, { id: replaceId, "aria-label": t("standalone.file-upload.multi-image.replace"), "aria-labelledby": `${replaceId} ${nameId}`, onClick: pickReplacement, children: _jsx(ReplaceIcon, {}) }), _jsx(IconButton, { id: removeId, "aria-label": t("standalone.file-upload.multi-image.remove"), "aria-labelledby": `${removeId} ${nameId}`, onClick: removeImage, children: _jsx(DeleteIcon, {}) })] }))] }), _jsx("span", { id: nameId, hidden: true, children: img.name }), !img.readOnly && (_jsx("input", { ref: replaceInput, type: "file", accept: "image/*", hidden: true, onChange: handleReplacementPicked }))] }));
};
export default React.memo(ImageDialogEntry);
