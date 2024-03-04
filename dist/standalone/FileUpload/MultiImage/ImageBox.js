import React, { useCallback, useEffect, useRef, useState, } from "react";
import makeStyles from "@mui/styles/makeStyles";
import { Dialog, DialogContent, IconButton, Tooltip, } from "@mui/material";
import { Close as CloseIcon, ArrowBack as PrevIcon, ArrowForward as NextIcon, Delete as DeleteIcon, } from "@mui/icons-material";
import combineClassNames from "../../../utils/combineClassNames";
import makeThemeStyles from "../../../utils/makeThemeStyles";
import { useDebounce } from "../../../utils/useDebounce";
import useDropZone from "../../../utils/useDropZone";
import ImageDots from "./ImageDots";
const swipeWidth = 30;
const useStyles = makeStyles((theme) => ({
    root: {
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
    },
    swipeListener: {
        height: "100%",
        width: "100%",
        overflowX: "auto",
        overflowY: "hidden",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        "&::-webkit-scrollbar": {
            display: "none",
        },
    },
    background: {
        backgroundColor: theme.palette.secondary.light,
    },
    clickable: {
        cursor: "pointer",
    },
    dragging: {
        border: `1px solid ${theme.palette.primary.main}`,
    },
    fullScreenImageWrapper: {
        width: "100%",
        height: "100%",
        position: "relative",
    },
    image: {
        width: "100%",
        left: swipeWidth,
        marginLeft: swipeWidth,
        marginRight: swipeWidth,
        height: "100%",
        objectFit: "contain",
        borderRadius: theme.shape.borderRadius,
    },
    imageSwipeLeft: {
        marginLeft: swipeWidth,
    },
    imageSwipeRight: {
        marginLeft: 0,
        marginRight: swipeWidth,
    },
    imageSwipeNone: {
        marginLeft: 0,
        marginRight: 0,
    },
    imageWithDots: {
        height: "calc(100% - 48px)",
    },
    removeBtn: {
        padding: theme.spacing(1),
        position: "absolute",
        top: 0,
        right: 0,
    },
    prevBtn: {
        position: "absolute",
        top: "50%",
        left: 0,
        transform: "translateY(-50%)",
    },
    nextBtn: {
        position: "absolute",
        top: "50%",
        right: 0,
        transform: "translateY(-50%)",
    },
    imageDotsWrapper: {
        position: "absolute",
        bottom: 16,
        left: "50%",
        height: 16,
        transform: "translateX(-50%)",
    },
    imageDotsContainer: {
        position: "unset",
        overflow: "unset",
    },
}), { name: "CcImageBox" });
const useThemeStyles = makeThemeStyles((theme) => theme.componentsCare?.fileUpload?.multiImage?.imageBox, "CcImageBox", useStyles);
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
const ImageBox = (props) => {
    const { image, width, height, onClick, onFilesDropped, onRemove, onNextImage, onPrevImage, disableBackground, fileName, imageDots, } = props;
    const classes = useThemeStyles(props);
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
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { onClick: onClick === null ? undefined : onClick ?? openDialog, onDragOver: handleDragOver, onDrop: handleDrop, style: { width, height }, className: combineClassNames([
                classes.root,
                !disableBackground && classes.background,
                dragging && classes.dragging,
                onClick !== null && classes.clickable,
            ]) },
            onRemove && (React.createElement(IconButton, { onClick: handleRemove, className: classes.removeBtn, size: "large" },
                React.createElement(DeleteIcon, null))),
            onPrevImage && (React.createElement(IconButton, { onClick: handlePrevImage, className: classes.prevBtn, size: "large" },
                React.createElement(PrevIcon, null))),
            onNextImage && (React.createElement(IconButton, { onClick: handleNextImage, className: classes.nextBtn, size: "large" },
                React.createElement(NextIcon, null))),
            React.createElement("div", { className: classes.swipeListener, onScroll: handleScrollImage, ref: containerRefImage, onTouchEnd: handleTouchEndImage },
                React.createElement(Tooltip, { title: fileName ?? "", disableTouchListener: !fileName, disableHoverListener: !fileName, disableFocusListener: !fileName },
                    React.createElement("img", { src: image, alt: "", className: combineClassNames([
                            classes.image,
                            onNextImage && !onPrevImage && classes.imageSwipeRight,
                            !onNextImage && onPrevImage && classes.imageSwipeLeft,
                            !onNextImage && !onPrevImage && classes.imageSwipeNone,
                        ]) })))),
        !onClick && (React.createElement(Dialog, { open: dialogOpen, fullScreen: true, onClose: closeDialog },
            React.createElement(DialogContent, null,
                React.createElement("div", { className: classes.fullScreenImageWrapper },
                    React.createElement("div", { className: classes.swipeListener, onScroll: handleScrollFS, ref: containerRefFS, onTouchEnd: handleTouchEndFS },
                        React.createElement("img", { src: image, alt: "", className: combineClassNames([
                                classes.image,
                                onNextImage && !onPrevImage && classes.imageSwipeRight,
                                !onNextImage && onPrevImage && classes.imageSwipeLeft,
                                !onNextImage && !onPrevImage && classes.imageSwipeNone,
                                imageDots && classes.imageWithDots,
                            ]) })),
                    React.createElement(IconButton, { onClick: closeDialog, className: classes.removeBtn, size: "large" },
                        React.createElement(CloseIcon, null)),
                    onPrevImage && (React.createElement(IconButton, { onClick: handlePrevImage, className: classes.prevBtn, size: "large" },
                        React.createElement(PrevIcon, null))),
                    onNextImage && (React.createElement(IconButton, { onClick: handleNextImage, className: classes.nextBtn, size: "large" },
                        React.createElement(NextIcon, null))),
                    imageDots && (React.createElement("div", { className: classes.imageDotsWrapper },
                        React.createElement(ImageDots, { ...imageDots, classes: {
                                imageDotContainer: classes.imageDotsContainer,
                                imageDotContainerContainer: classes.imageDotsContainer,
                            } })))))))));
};
export default React.memo(ImageBox);
