import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Dialog, IconButton, styled, useThemeProps } from "@mui/material";
import { Close as CloseIcon, RotateLeft as RotateLeftIcon, RotateRight as RotateRightIcon, } from "@mui/icons-material";
import useImageZoomPan from "../../../utils/useImageZoomPan";
import useCCTranslations from "../../../utils/useCCTranslations";
const Root = styled(Dialog, {
    name: "CcImagePreviewDialog",
    slot: "root",
})({});
const CloseButton = styled(IconButton, {
    name: "CcImagePreviewDialog",
    slot: "closeButton",
})(({ theme }) => ({
    position: "absolute",
    top: theme.spacing(2),
    right: theme.spacing(2),
    zIndex: 1,
}));
const RotateButtons = styled("div", {
    name: "CcImagePreviewDialog",
    slot: "rotateButtons",
})(({ theme }) => ({
    position: "absolute",
    top: theme.spacing(2),
    left: theme.spacing(2),
    zIndex: 1,
    display: "flex",
}));
const RotateLeftButton = styled(IconButton, {
    name: "CcImagePreviewDialog",
    slot: "rotateLeftButton",
})({});
const RotateRightButton = styled(IconButton, {
    name: "CcImagePreviewDialog",
    slot: "rotateRightButton",
})({});
const Container = styled("div", {
    name: "CcImagePreviewDialog",
    slot: "container",
})({
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "grab",
    "&:active": {
        cursor: "grabbing",
    },
});
const PreviewImage = styled("img", {
    name: "CcImagePreviewDialog",
    slot: "image",
})({
    objectFit: "contain",
    display: "block",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    userSelect: "none",
});
const ImagePreviewDialog = (inProps) => {
    const props = useThemeProps({
        props: inProps,
        name: "CcImagePreviewDialog",
    });
    const { src, alt, open, onClose, disableRotation, classes } = props;
    const { t } = useCCTranslations();
    const { imgRef, containerRef, containerProps, rotateLeft, rotateRight } = useImageZoomPan(open, src);
    return (_jsxs(Root, { open: open, fullScreen: true, onClose: onClose, className: classes?.root, children: [_jsx(CloseButton, { onClick: onClose, "aria-label": t("standalone.file-upload.close"), className: classes?.closeButton, children: _jsx(CloseIcon, {}) }), !disableRotation && (_jsxs(RotateButtons, { className: classes?.rotateButtons, children: [_jsx(RotateLeftButton, { onClick: rotateLeft, "aria-label": t("standalone.file-upload.rotate-left"), className: classes?.rotateLeftButton, children: _jsx(RotateLeftIcon, {}) }), _jsx(RotateRightButton, { onClick: rotateRight, "aria-label": t("standalone.file-upload.rotate-right"), className: classes?.rotateRightButton, children: _jsx(RotateRightIcon, {}) })] })), _jsx(Container, { ref: containerRef, ...containerProps, className: classes?.container, children: _jsx(PreviewImage, { ref: imgRef, src: src, alt: alt, className: classes?.image, draggable: false }) })] }));
};
export default React.memo(ImagePreviewDialog);
