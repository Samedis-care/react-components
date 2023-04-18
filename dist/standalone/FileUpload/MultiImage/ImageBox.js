var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import React, { useCallback, useEffect, useRef, useState, } from "react";
import makeStyles from "@mui/styles/makeStyles";
import { Dialog, DialogContent, IconButton, Tooltip, } from "@mui/material";
import { Close as CloseIcon, ArrowBack as PrevIcon, ArrowForward as NextIcon, Delete as DeleteIcon, } from "@mui/icons-material";
import { combineClassNames, makeThemeStyles, useDebounce, useDropZone, } from "../../../utils";
import ImageDots from "./ImageDots";
var swipeWidth = 30;
var useStyles = makeStyles(function (theme) { return ({
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
        border: "1px solid ".concat(theme.palette.primary.main),
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
}); }, { name: "CcImageBox" });
var useThemeStyles = makeThemeStyles(function (theme) { var _a, _b, _c; return (_c = (_b = (_a = theme.componentsCare) === null || _a === void 0 ? void 0 : _a.fileUpload) === null || _b === void 0 ? void 0 : _b.multiImage) === null || _c === void 0 ? void 0 : _c.imageBox; }, "CcImageBox", useStyles);
var useScrollSwipe = function (params) {
    var onPrevImage = params.onPrevImage, onNextImage = params.onNextImage;
    var handleResetScroll = useCallback(function () {
        var ref = containerRef.current;
        if (!ref)
            return;
        var scrollBase = onPrevImage ? swipeWidth : 0;
        ref.scrollTo(scrollBase, 0);
        scrolled.current = false;
    }, [onPrevImage]);
    var _a = useDebounce(handleResetScroll, 200), debouncedHandleResetScroll = _a[0], cancelResetScroll = _a[1];
    var handleScroll = useCallback(function (evt) {
        var x = evt.currentTarget.scrollLeft;
        var scrollTarget = onPrevImage ? swipeWidth * 2 : swipeWidth;
        var resetScroll = false;
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
    useEffect(function () {
        handleResetScroll();
    }, [onPrevImage, onNextImage, handleResetScroll]);
    var scrolled = useRef(false);
    var containerRef = useRef(null);
    useEffect(function () {
        handleResetScroll();
        cancelResetScroll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handleResetScroll]);
    return { containerRef: containerRef, handleScroll: handleScroll, handleTouchEnd: handleResetScroll };
};
var ImageBox = function (props) {
    var image = props.image, width = props.width, height = props.height, onClick = props.onClick, onFilesDropped = props.onFilesDropped, onRemove = props.onRemove, onNextImage = props.onNextImage, onPrevImage = props.onPrevImage, disableBackground = props.disableBackground, fileName = props.fileName, imageDots = props.imageDots;
    var classes = useThemeStyles(props);
    var _a = useDropZone(onFilesDropped), handleDragOver = _a.handleDragOver, handleDrop = _a.handleDrop, dragging = _a.dragging;
    var _b = useState(false), dialogOpen = _b[0], setDialogOpen = _b[1];
    var openDialog = useCallback(function () {
        setDialogOpen(true);
    }, []);
    var closeDialog = useCallback(function () {
        setDialogOpen(false);
    }, []);
    var handleRemove = useCallback(function (evt) {
        evt.stopPropagation();
        if (onRemove)
            onRemove();
    }, [onRemove]);
    var handlePrevImage = useCallback(function (evt) {
        evt.stopPropagation();
        if (onPrevImage)
            onPrevImage();
    }, [onPrevImage]);
    var handleNextImage = useCallback(function (evt) {
        evt.stopPropagation();
        if (onNextImage)
            onNextImage();
    }, [onNextImage]);
    var _c = useScrollSwipe(props), containerRefImage = _c.containerRef, handleScrollImage = _c.handleScroll, handleTouchEndImage = _c.handleTouchEnd;
    var _d = useScrollSwipe(props), containerRefFS = _d.containerRef, handleScrollFS = _d.handleScroll, handleTouchEndFS = _d.handleTouchEnd;
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { onClick: onClick === null ? undefined : onClick !== null && onClick !== void 0 ? onClick : openDialog, onDragOver: handleDragOver, onDrop: handleDrop, style: { width: width, height: height }, className: combineClassNames([
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
                React.createElement(Tooltip, { title: fileName !== null && fileName !== void 0 ? fileName : "", disableTouchListener: !fileName, disableHoverListener: !fileName, disableFocusListener: !fileName },
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
                        React.createElement(ImageDots, __assign({}, imageDots, { classes: {
                                imageDotContainer: classes.imageDotsContainer,
                                imageDotContainerContainer: classes.imageDotsContainer,
                            } }))))))))));
};
export default React.memo(ImageBox);
