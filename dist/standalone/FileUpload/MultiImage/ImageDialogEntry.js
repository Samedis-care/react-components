import React, { useCallback } from "react";
import ImageBox from "./ImageBox";
import { Box, Grid, Typography } from "@mui/material";
import { Star as StarredIcon, StarOutline as NotStarredIcon, } from "@mui/icons-material";
import makeStyles from "@mui/styles/makeStyles";
import useCCTranslations from "../../../utils/useCCTranslations";
import { makeThemeStyles } from "../../../utils";
const useStyles = makeStyles({
    clickable: {
        cursor: "pointer",
    },
}, { name: "CcImageDialogEntry" });
const useThemeStyles = makeThemeStyles((theme) => theme.componentsCare?.fileUpload?.multiImage?.imageDialogEntry, "CcImageDialogEntry", useStyles);
const ImageDialogEntry = (props) => {
    const { previewSize, img, isPrimary, changeImages, changePrimary, processFile, subClasses, onDelete, } = props;
    const { t } = useCCTranslations();
    const classes = useThemeStyles(props);
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
    const replaceImage = useCallback(async (files) => {
        const file = files.item(0);
        if (!file)
            return;
        const imageData = await processFile(file);
        changeImages((images) => images.map((image) => image === img ? { ...image, image: imageData } : image));
    }, [changeImages, img, processFile]);
    return (React.createElement(Grid, { item: true, xs: previewSize ? undefined : 12, md: previewSize ? undefined : 6, lg: previewSize ? undefined : 3 },
        React.createElement("div", null,
            React.createElement(ImageBox, { fileName: img.name, width: previewSize, height: previewSize, image: img.image, onRemove: img.readOnly ? undefined : removeImage, onFilesDropped: img.readOnly ? undefined : replaceImage, classes: subClasses?.imageBox })),
        React.createElement(Box, { mt: 1 },
            React.createElement(Grid, { container: true, spacing: 1, alignItems: "center", justifyContent: "flex-start", className: isPrimary ? undefined : classes.clickable, onClick: isPrimary ? undefined : setPrimary },
                React.createElement(Grid, { item: true }, isPrimary ? React.createElement(StarredIcon, { color: "primary" }) : React.createElement(NotStarredIcon, null)),
                React.createElement(Grid, { item: true },
                    React.createElement(Typography, null, t("standalone.file-upload.multi-image.primary")))))));
};
export default React.memo(ImageDialogEntry);
