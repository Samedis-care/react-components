import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback } from "react";
import ImageBox from "./ImageBox";
import { Box, Grid, styled, Typography, useThemeProps } from "@mui/material";
import { Star as StarredIcon, StarOutlined as NotStarredIcon, } from "@mui/icons-material";
import useCCTranslations from "../../../utils/useCCTranslations";
import combineClassNames from "../../../utils/combineClassNames";
const Root = styled(Grid, { name: "CcImageDialogEntry", slot: "root" })({});
const MakePrimary = styled(Grid, {
    name: "CcImageDialogEntry",
    slot: "makePrimary",
})({
    cursor: "pointer",
});
const IsPrimary = styled(Grid, {
    name: "CcImageDialogEntry",
    slot: "isPrimary",
})({});
const ImageDialogEntry = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcImageDialogEntry" });
    const { previewSize, img, isPrimary, changeImages, changePrimary, processFile, subClasses, onDelete, className, classes, } = props;
    const { t } = useCCTranslations();
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
    const PrimaryComp = isPrimary ? IsPrimary : MakePrimary;
    return (_jsxs(Root, { size: previewSize ? undefined : { xs: 12, md: 6, lg: 3 }, className: combineClassNames([className, classes?.root]), children: [_jsx("div", { children: _jsx(ImageBox, { fileName: img.name, width: previewSize, height: previewSize, image: img.image, onRemove: img.readOnly ? undefined : removeImage, onFilesDropped: img.readOnly ? undefined : replaceImage, classes: subClasses?.imageBox }) }), _jsx(Box, { sx: { mt: 1 }, children: _jsxs(PrimaryComp, { container: true, spacing: 1, sx: { alignItems: "center", justifyContent: "flex-start" }, className: isPrimary ? classes?.isPrimary : classes?.makePrimary, onClick: isPrimary ? undefined : setPrimary, children: [_jsx(Grid, { children: isPrimary ? _jsx(StarredIcon, { color: "primary" }) : _jsx(NotStarredIcon, {}) }), _jsx(Grid, { children: _jsx(Typography, { children: t("standalone.file-upload.multi-image.primary") }) })] }) })] }));
};
export default React.memo(ImageDialogEntry);
