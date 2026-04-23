import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useCallback, useEffect, useRef, useState, } from "react";
import useDropZone from "../../../utils/useDropZone";
import { Dialog, DialogContent, IconButton, styled, Tooltip, useThemeProps, } from "@mui/material";
import { ArrowBack as PrevIcon, ArrowForward as NextIcon, Close as CloseIcon, Delete as DeleteIcon, } from "@mui/icons-material";
import combineClassNames from "../../../utils/combineClassNames";
import useCCTranslations from "../../../utils/useCCTranslations";
import { useDebounce } from "../../../utils/useDebounce";
import ImageDots from "./ImageDots";
import useImageZoomPan from "../../../utils/useImageZoomPan";
const swipeWidth = 30;
const Root = styled("div", { name: "CcImageBox", slot: "root" })(({ theme, ownerState: { background, dragging, clickable } }) => ({
    borderRadius: theme.shape.borderRadius,
    position: "relative",
    height: "100%",
    "& button": {
        visibility: "hidden",
        opacity: 0,
        transition: "visibility 0s linear 300ms, opacity 300ms",
    },
    "&:hover button": {
        visibility: "visible",
        opacity: 1,
        transition: "visibility 0s linear 0s, opacity 300ms",
    },
    ...(background && {
        backgroundColor: theme.palette.secondary.light,
    }),
    ...(dragging && {
        border: `1px solid ${theme.palette.primary.main}`,
    }),
    ...(clickable && {
        cursor: "pointer",
    }),
}));
const RemoveButton = styled(IconButton, {
    name: "CcImageBox",
    slot: "removeBtn",
})(({ theme }) => ({
    padding: theme.spacing(1),
    position: "absolute",
    top: 0,
    right: 0,
}));
const PrevButton = styled(IconButton, { name: "CcImageBox", slot: "prevBtn" })({
    position: "absolute",
    top: "50%",
    left: 0,
    transform: "translateY(-50%)",
});
const NextButton = styled(IconButton, { name: "CcImageBox", slot: "nextBtn" })({
    position: "absolute",
    top: "50%",
    right: 0,
    transform: "translateY(-50%)",
});
const SwipeListener = styled("div", {
    name: "CcImageBox",
    slot: "swipeListener",
})({
    height: "100%",
    width: "100%",
    overflowX: "auto",
    overflowY: "hidden",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    "&::-webkit-scrollbar": {
        display: "none",
    },
});
const StyledImage = styled("img", { name: "CcImageBox", slot: "image" })(({ theme, ownerState: { swipeLeft, swipeRight, imageDots } }) => ({
    width: "100%",
    left: swipeWidth,
    marginLeft: swipeWidth,
    marginRight: swipeWidth,
    height: "100%",
    objectFit: "contain",
    borderRadius: theme.shape.borderRadius,
    ...(swipeLeft &&
        !swipeRight && {
        marginLeft: swipeWidth,
    }),
    ...(swipeRight &&
        !swipeLeft && {
        marginLeft: 0,
        marginRight: swipeWidth,
    }),
    ...(!swipeRight &&
        !swipeLeft && {
        marginLeft: 0,
        marginRight: 0,
    }),
    ...(imageDots && {
        height: "calc(100% - 48px)",
    }),
}));
const StyledDialog = styled(Dialog, {
    name: "CcImageBox",
    slot: "fullScreenDialog",
})({});
const FullScreenImageWrapper = styled("div", {
    name: "CcImageBox",
    slot: "fullScreenImageWrapper",
})({
    width: "100%",
    height: "100%",
    position: "relative",
});
const FullScreenZoomContainer = styled("div", {
    name: "CcImageBox",
    slot: "fullScreenZoomContainer",
})({
    width: "100%",
    height: "100%",
    cursor: "grab",
    "&:active": {
        cursor: "grabbing",
    },
    "& img": {
        pointerEvents: "none",
        userSelect: "none",
    },
});
const ImageDotsWrapper = styled("div", {
    name: "CcImageBox",
    slot: "imageDotsWrapper",
})({
    position: "absolute",
    bottom: 16,
    left: "50%",
    height: 16,
    transform: "translateX(-50%)",
});
const StyledImageDots = styled(ImageDots, {
    name: "CcImageBox",
    slot: "imageDots",
})({
    position: "unset",
    overflow: "unset",
    "& .CcImageDots-container": {
        position: "unset",
        overflow: "unset",
    },
});
const useScrollSwipe = (params) => {
    const { onPrevImage, onNextImage } = params;
    const handleResetScroll = useCallback(() => {
        const ref = containerRef.current;
        if (!ref)
            return;
        const scrollBase = onPrevImage ? swipeWidth : 0;
        ref.scrollTo(scrollBase, 0);
        scrolled.current = false;
    }, [onPrevImage]);
    const [debouncedHandleResetScroll, cancelResetScroll] = useDebounce(handleResetScroll, 200);
    const handleScroll = useCallback((evt) => {
        const x = evt.currentTarget.scrollLeft;
        const scrollTarget = onPrevImage ? swipeWidth * 2 : swipeWidth;
        let resetScroll = false;
        if (scrolled.current) {
            resetScroll = true;
        }
        else {
            if (x <= 1 && onPrevImage) {
                onPrevImage();
                resetScroll = true;
            }
            if (x >= scrollTarget - 1 && onNextImage) {
                onNextImage();
                resetScroll = true;
            }
        }
        if (resetScroll) {
            scrolled.current = true;
            cancelResetScroll();
        }
        else {
            debouncedHandleResetScroll();
        }
    }, [cancelResetScroll, debouncedHandleResetScroll, onNextImage, onPrevImage]);
    useEffect(() => {
        handleResetScroll();
    }, [onPrevImage, onNextImage, handleResetScroll]);
    const scrolled = useRef(false);
    const containerRef = useRef(null);
    useEffect(() => {
        handleResetScroll();
        cancelResetScroll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handleResetScroll]);
    return { containerRef, handleScroll, handleTouchEnd: handleResetScroll };
};
const ImageBox = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcImageBox" });
    const { t } = useCCTranslations();
    const { image, width, height, onClick, onFilesDropped, onRemove, onNextImage, onPrevImage, disableBackground, fileName, imageDots, className, classes, } = props;
    const { handleDragOver, handleDrop, dragging } = useDropZone(onFilesDropped);
    const [dialogOpen, setDialogOpen] = useState(false);
    const openDialog = useCallback(() => {
        setDialogOpen(true);
    }, []);
    const closeDialog = useCallback(() => {
        setDialogOpen(false);
    }, []);
    const handleRemove = useCallback((evt) => {
        evt.stopPropagation();
        if (onRemove)
            onRemove();
    }, [onRemove]);
    const handlePrevImage = useCallback((evt) => {
        evt.stopPropagation();
        if (onPrevImage)
            onPrevImage();
    }, [onPrevImage]);
    const handleNextImage = useCallback((evt) => {
        evt.stopPropagation();
        if (onNextImage)
            onNextImage();
    }, [onNextImage]);
    const { containerRef: containerRefImage, handleScroll: handleScrollImage, handleTouchEnd: handleTouchEndImage, } = useScrollSwipe(props);
    const { containerRef: containerRefFS, handleScroll: handleScrollFS, handleTouchEnd: handleTouchEndFS, } = useScrollSwipe(props);
    const { imgRef: zoomImgRef, containerRef: zoomContainerRef, containerProps: zoomContainerProps, } = useImageZoomPan(dialogOpen);
    return (_jsxs(_Fragment, { children: [_jsxs(Root, { onClick: onClick === null ? undefined : (onClick ?? openDialog), onDragOver: handleDragOver, onDrop: handleDrop, style: { width, height }, ownerState: {
                    clickable: !!onClick,
                    dragging,
                    background: !disableBackground,
                }, className: combineClassNames([className, classes?.root]), children: [onRemove && (_jsx(RemoveButton, { onClick: handleRemove, className: classes?.removeBtn, size: "large", "aria-label": t("standalone.file-upload.multi-image.remove"), children: _jsx(DeleteIcon, {}) })), onPrevImage && (_jsx(PrevButton, { onClick: handlePrevImage, className: classes?.prevBtn, size: "large", "aria-label": t("standalone.file-upload.multi-image.prev-image"), children: _jsx(PrevIcon, {}) })), onNextImage && (_jsx(NextButton, { onClick: handleNextImage, className: classes?.nextBtn, size: "large", "aria-label": t("standalone.file-upload.multi-image.next-image"), children: _jsx(NextIcon, {}) })), _jsx(SwipeListener, { className: classes?.swipeListener, onScroll: handleScrollImage, ref: containerRefImage, onTouchEnd: handleTouchEndImage, children: _jsx(Tooltip, { title: fileName ?? "", disableTouchListener: !fileName, disableHoverListener: !fileName, disableFocusListener: !fileName, children: _jsx(StyledImage, { src: image, alt: "", ownerState: {
                                    swipeLeft: !!onPrevImage,
                                    swipeRight: !!onNextImage,
                                    imageDots: false,
                                }, className: classes?.image }) }) })] }), !onClick && (_jsx(StyledDialog, { open: dialogOpen, fullScreen: true, onClose: closeDialog, children: _jsx(DialogContent, { children: _jsxs(FullScreenImageWrapper, { className: classes?.fullScreenImageWrapper, children: [_jsx(SwipeListener, { className: classes?.swipeListener, onScroll: handleScrollFS, ref: containerRefFS, onTouchEnd: handleTouchEndFS, children: _jsx(FullScreenZoomContainer, { ref: zoomContainerRef, ...zoomContainerProps, className: classes?.fullScreenZoomContainer, children: _jsx(StyledImage, { ref: zoomImgRef, src: image, alt: "", draggable: false, ownerState: {
                                            swipeLeft: !!onPrevImage,
                                            swipeRight: !!onNextImage,
                                            imageDots: !imageDots,
                                        }, className: classes?.image }) }) }), _jsx(RemoveButton, { onClick: closeDialog, className: classes?.removeBtn, size: "large", "aria-label": t("standalone.file-upload.close"), children: _jsx(CloseIcon, {}) }), onPrevImage && (_jsx(PrevButton, { onClick: handlePrevImage, className: classes?.prevBtn, size: "large", "aria-label": t("standalone.file-upload.multi-image.prev-image"), children: _jsx(PrevIcon, {}) })), onNextImage && (_jsx(NextButton, { onClick: handleNextImage, className: classes?.nextBtn, size: "large", "aria-label": t("standalone.file-upload.multi-image.next-image"), children: _jsx(NextIcon, {}) })), imageDots && (_jsx(ImageDotsWrapper, { className: classes?.imageDotsWrapper, children: _jsx(StyledImageDots, { ...imageDots, className: combineClassNames([
                                        classes?.imageDots,
                                        imageDots.className,
                                    ]) }) }))] }) }) }))] }));
};
export default React.memo(ImageBox);
