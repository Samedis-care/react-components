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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Dialog, DialogActions, IconButton, Typography, } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import MuiDialogTitle from "@mui/material/DialogTitle";
import { Close } from "@mui/icons-material";
import SignaturePad from "react-signature-canvas";
import { useDialogContext } from "../../framework";
import useCCTranslations from "../../utils/useCCTranslations";
var useStyles = makeStyles(function (theme) { return ({
    root: {
        margin: 0,
        padding: theme.spacing(2),
    },
    closeButton: {
        position: "absolute",
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
    },
    signDiv: {
        border: "1px dotted",
        marginLeft: 10,
        marginRight: 10,
        height: "min(calc(100vh - 192px), 300px)",
        width: "min(calc(100vw - 64px - 20px), 580px)",
    },
    imageDiv: {
        width: 300,
        height: 150,
        display: "table-cell",
        verticalAlign: "middle",
        textAlign: "center",
    },
    hiddenDiv: {
        left: -500,
        position: "absolute",
    },
}); }, { name: "CcSignPadDialog" });
var SignPadDialog = function (props) {
    var t = useCCTranslations().t;
    var penColor = props.penColor, setSignature = props.setSignature, signature = props.signature, canvasProps = __rest(props, ["penColor", "setSignature", "signature"]);
    var _a = useState(!!signature), resetCanvas = _a[0], setResetCanvas = _a[1];
    var _b = useDialogContext(), popDialog = _b[1];
    var canvasWrapper = useRef();
    var signCanvas = useRef(null);
    var hiddenRef = useRef(null);
    var _c = useState([0, 0]), canvasSize = _c[0], setCanvasSize = _c[1];
    var classes = useStyles(props);
    var clearCanvas = useCallback(function () {
        if (signCanvas.current) {
            signCanvas.current.clear();
        }
        setResetCanvas(false);
    }, []);
    var saveCanvas = useCallback(function () {
        var _a, _b;
        if (signCanvas.current && !signCanvas.current.isEmpty()) {
            var signature_1 = signCanvas.current
                .getTrimmedCanvas()
                .toDataURL("image/png");
            if (setSignature)
                setSignature(signature_1);
        }
        else {
            if (setSignature)
                setSignature("");
        }
        (_a = hiddenRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        (_b = hiddenRef.current) === null || _b === void 0 ? void 0 : _b.blur();
        popDialog();
    }, [setSignature, popDialog]);
    var closeCanvas = useCallback(function () {
        var _a, _b;
        (_a = hiddenRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        (_b = hiddenRef.current) === null || _b === void 0 ? void 0 : _b.blur();
        popDialog();
    }, [popDialog]);
    var handleResize = useCallback(function (wrapper) {
        setCanvasSize([wrapper.clientWidth, wrapper.clientHeight]);
    }, []);
    var setCanvasWrapperRef = useCallback(function (node) {
        canvasWrapper.current = node;
        if (node) {
            handleResize(node);
        }
    }, [handleResize]);
    useEffect(function () {
        var resizeHandler = function () {
            return canvasWrapper.current && handleResize(canvasWrapper.current);
        };
        window.addEventListener("resize", resizeHandler);
        return function () { return window.removeEventListener("resize", resizeHandler); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canvasWrapper.current]);
    return (React.createElement(Dialog, { open: true, maxWidth: "sm", onClose: closeCanvas },
        React.createElement(MuiDialogTitle, { id: "sign-pad-dialog", className: classes.root },
            React.createElement(Typography, { variant: "h6" }, t("standalone.signature-pad.dialog.title")),
            closeCanvas && (React.createElement(IconButton, { "aria-label": "Close", className: classes.closeButton, onClick: closeCanvas, size: "large" },
                React.createElement(Close, null)))),
        React.createElement("div", { className: classes.signDiv, ref: setCanvasWrapperRef },
            !resetCanvas ? (React.createElement(SignaturePad, __assign({ ref: signCanvas, penColor: penColor || "blue" }, canvasProps, { canvasProps: {
                    width: canvasSize[0],
                    height: canvasSize[1],
                } }))) : (React.createElement("div", { className: classes.imageDiv },
                React.createElement("img", { src: signature, alt: "Sign" }))),
            React.createElement("div", { className: classes.hiddenDiv },
                React.createElement("input", { type: "text", value: signature !== null && signature !== void 0 ? signature : "", readOnly: true, ref: hiddenRef, name: props.name, onBlur: props.onBlur }))),
        React.createElement(DialogActions, null,
            React.createElement(Button, { onClick: saveCanvas, color: "primary" }, t("standalone.signature-pad.dialog.save-changes")),
            React.createElement(Button, { onClick: clearCanvas, color: "secondary" }, t("standalone.signature-pad.dialog.reset")))));
};
export var SignDialog = React.memo(SignPadDialog);
