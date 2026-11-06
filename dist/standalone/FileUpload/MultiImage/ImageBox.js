import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useCallback, useEffect, useRef, useState, } from "react";
import useDropZone from "../../../utils/useDropZone";
import { ButtonBase, Dialog, DialogContent, IconButton, iconButtonClasses, styled, Tooltip, useThemeProps, } from "@mui/material";
import { ArrowBack as PrevIcon, ArrowForward as NextIcon, Close as CloseIcon, RotateLeft as RotateLeftIcon, RotateRight as RotateRightIcon, } from "@mui/icons-material";
import combineClassNames from "../../../utils/combineClassNames";
import useCCTranslations from "../../../utils/useCCTranslations";
import { useDebounce } from "../../../utils/useDebounce";
import ImageDots from "./ImageDots";
import useImageZoomPan from "../../../utils/useImageZoomPan";
import useObjectUrl from "../../../utils/useObjectUrl";
import focusRing from "../../../utils/internal/focusRing";
const swipeWidth = 30;
const Root = styled("div", { name: "CcImageBox", slot: "root" })(({ theme, ownerState: { background, dragging, clickable } }) => ({
    borderRadius: theme.shape.borderRadius,
    position: "relative",
    height: "100%",
    // Previous and Next over the image show while the box is hovered or holds the focus, and
    // always where nothing can hover. opacity, not visibility: hidden by opacity they stay in
    // the tab order and the accessibility tree, and focusing one shows it.
    [`& > .${iconButtonClasses.root}`]: {
        opacity: 0,
        transition: "opacity 300ms",
    },
    [`&:hover > .${iconButtonClasses.root}`]: {
        opacity: 1,
    },
    // at once: a button the keyboard focus moves to is visible from the start
    [`&:focus-within > .${iconButtonClasses.root}`]: {
        opacity: 1,
        transition: "none",
    },
    "@media (hover: none)": {
        [`& > .${iconButtonClasses.root}`]: {
            opacity: 1,
        },
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
/**
 * State classes of the open button: there is a previous (swipeLeft) or a next (swipeRight)
 * image, so the swipe pane needs room on that side
 */
const openButtonClasses = {
    swipeLeft: "CcImageBox-swipeLeft",
    swipeRight: "CcImageBox-swipeRight",
};
const OpenButton = styled(ButtonBase, {
    name: "CcImageBox",
    slot: "openButton",
})(({ theme }) => ({
    // in the swipe pane in place of the image, laid out as the image was: the image fills
    // the button, and the swipe room is the button's margin
    display: "inline-block",
    verticalAlign: "baseline",
    width: "100%",
    height: "100%",
    borderRadius: theme.shape.borderRadius,
    [`&.${openButtonClasses.swipeLeft}`]: {
        marginLeft: swipeWidth,
    },
    [`&.${openButtonClasses.swipeLeft}, &.${openButtonClasses.swipeRight}`]: {
        marginRight: swipeWidth,
    },
    "& > img": {
        display: "block",
        margin: 0,
    },
    // inside the button: the swipe pane cuts off what lies outside it
    "&.Mui-focusVisible": focusRing(theme, -2),
}));
const FullScreenRotateButtons = styled("div", {
    name: "CcImageBox",
    slot: "fullScreenRotateButtons",
})({
    position: "absolute",
    top: 0,
    left: 0,
    display: "flex",
});
const RotateLeftButton = styled(IconButton, {
    name: "CcImageBox",
    slot: "rotateLeftBtn",
})(({ theme }) => ({
    padding: theme.spacing(1),
}));
const RotateRightButton = styled(IconButton, {
    name: "CcImageBox",
    slot: "rotateRightBtn",
})(({ theme }) => ({
    padding: theme.spacing(1),
}));
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
    const { image, width, height, onClick, onFilesDropped, onNextImage, onPrevImage, disableBackground, disableRotation, fileName, imageDots, className, classes, } = props;
    const src = useObjectUrl(image);
    const { handleDragOver, handleDrop, dragging } = useDropZone(onFilesDropped);
    const [dialogOpen, setDialogOpen] = useState(false);
    const openDialog = useCallback(() => {
        setDialogOpen(true);
    }, []);
    const closeDialog = useCallback(() => {
        setDialogOpen(false);
    }, []);
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
    const { imgRef: zoomImgRef, containerRef: zoomContainerRef, containerProps: zoomContainerProps, rotateLeft, rotateRight, } = useImageZoomPan(dialogOpen, src);
    const boxImage = (_jsx(Tooltip, { title: fileName ?? "", disableTouchListener: !fileName, disableHoverListener: !fileName, disableFocusListener: !fileName, children: _jsx(StyledImage, { src: src, alt: "", ownerState: {
                swipeLeft: !!onPrevImage,
                swipeRight: !!onNextImage,
                imageDots: false,
            }, className: classes?.image }) }));
    return (_jsxs(_Fragment, { children: [_jsxs(Root, { onClick: onClick === null ? undefined : (onClick ?? openDialog), onDragOver: handleDragOver, onDrop: handleDrop, style: { width, height }, ownerState: {
                    clickable: !!onClick,
                    dragging,
                    background: !disableBackground,
                }, className: combineClassNames([className, classes?.root]), children: [_jsx(SwipeListener, { className: classes?.swipeListener, onScroll: handleScrollImage, ref: containerRefImage, onTouchEnd: handleTouchEndImage, children: onClick === undefined ? (_jsx(OpenButton, { "aria-label": fileName
                                ? t("standalone.file-upload.multi-image.open-full-screen", {
                                    NAME: fileName,
                                })
                                : t("standalone.file-upload.multi-image.open-full-screen-unnamed"), className: combineClassNames([
                                onPrevImage && openButtonClasses.swipeLeft,
                                onNextImage && openButtonClasses.swipeRight,
                                classes?.openButton,
                            ]), children: boxImage })) : (boxImage) }), onPrevImage && (_jsx(PrevButton, { onClick: handlePrevImage, className: classes?.prevBtn, size: "large", "aria-label": t("standalone.file-upload.multi-image.prev-image"), children: _jsx(PrevIcon, {}) })), onNextImage && (_jsx(NextButton, { onClick: handleNextImage, className: classes?.nextBtn, size: "large", "aria-label": t("standalone.file-upload.multi-image.next-image"), children: _jsx(NextIcon, {}) }))] }), !onClick && (_jsx(StyledDialog, { open: dialogOpen, fullScreen: true, onClose: closeDialog, children: _jsx(DialogContent, { children: _jsxs(FullScreenImageWrapper, { className: classes?.fullScreenImageWrapper, children: [_jsx(SwipeListener, { className: classes?.swipeListener, onScroll: handleScrollFS, ref: containerRefFS, onTouchEnd: handleTouchEndFS, children: _jsx(FullScreenZoomContainer, { ref: zoomContainerRef, ...zoomContainerProps, className: classes?.fullScreenZoomContainer, children: _jsx(StyledImage, { ref: zoomImgRef, src: src, alt: "", draggable: false, ownerState: {
                                            swipeLeft: !!onPrevImage,
                                            swipeRight: !!onNextImage,
                                            imageDots: !imageDots,
                                        }, className: classes?.image }) }) }), _jsx(RemoveButton, { onClick: closeDialog, className: classes?.removeBtn, size: "large", "aria-label": t("standalone.file-upload.close"), children: _jsx(CloseIcon, {}) }), !disableRotation && (_jsxs(FullScreenRotateButtons, { className: classes?.fullScreenRotateButtons, children: [_jsx(RotateLeftButton, { onClick: rotateLeft, className: classes?.rotateLeftBtn, size: "large", "aria-label": t("standalone.file-upload.rotate-left"), children: _jsx(RotateLeftIcon, {}) }), _jsx(RotateRightButton, { onClick: rotateRight, className: classes?.rotateRightBtn, size: "large", "aria-label": t("standalone.file-upload.rotate-right"), children: _jsx(RotateRightIcon, {}) })] })), onPrevImage && (_jsx(PrevButton, { onClick: handlePrevImage, className: classes?.prevBtn, size: "large", "aria-label": t("standalone.file-upload.multi-image.prev-image"), children: _jsx(PrevIcon, {}) })), onNextImage && (_jsx(NextButton, { onClick: handleNextImage, className: classes?.nextBtn, size: "large", "aria-label": t("standalone.file-upload.multi-image.next-image"), children: _jsx(NextIcon, {}) })), imageDots && (_jsx(ImageDotsWrapper, { className: classes?.imageDotsWrapper, children: _jsx(StyledImageDots, { ...imageDots, className: combineClassNames([
                                        classes?.imageDots,
                                        imageDots.className,
                                    ]) }) }))] }) }) }))] }));
};
export default React.memo(ImageBox);
