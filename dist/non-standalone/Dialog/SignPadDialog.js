import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Dialog, DialogActions, IconButton, Typography, } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import MuiDialogTitle from "@mui/material/DialogTitle";
import { Close } from "@mui/icons-material";
import SignaturePad from "react-signature-canvas";
import { useDialogContext } from "../../framework";
import useCCTranslations from "../../utils/useCCTranslations";
const useStyles = makeStyles((theme) => ({
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
}), { name: "CcSignPadDialog" });
const SignPadDialog = (props) => {
    const { t } = useCCTranslations();
    const { penColor, setSignature, signature, ...canvasProps } = props;
    const [resetCanvas, setResetCanvas] = useState(!!signature);
    const [, popDialog] = useDialogContext();
    const canvasWrapper = useRef();
    const signCanvas = useRef(null);
    const hiddenRef = useRef(null);
    const [canvasSize, setCanvasSize] = useState([0, 0]);
    const classes = useStyles(props);
    const clearCanvas = useCallback(() => {
        if (signCanvas.current) {
            signCanvas.current.clear();
        }
        setResetCanvas(false);
    }, []);
    const saveCanvas = useCallback(() => {
        if (signCanvas.current && !signCanvas.current.isEmpty()) {
            const newSignature = signCanvas.current
                .getTrimmedCanvas()
                .toDataURL("image/png");
            if (setSignature)
                setSignature(newSignature);
        }
        else {
            if (setSignature)
                setSignature(resetCanvas ? signature : "");
        }
        hiddenRef.current?.focus();
        hiddenRef.current?.blur();
        popDialog();
    }, [setSignature, popDialog, signature, resetCanvas]);
    const closeCanvas = useCallback(() => {
        hiddenRef.current?.focus();
        hiddenRef.current?.blur();
        popDialog();
    }, [popDialog]);
    const handleResize = useCallback((wrapper) => {
        setCanvasSize([wrapper.clientWidth, wrapper.clientHeight]);
    }, []);
    const setCanvasWrapperRef = useCallback((node) => {
        canvasWrapper.current = node;
        if (node) {
            handleResize(node);
        }
    }, [handleResize]);
    useEffect(() => {
        const resizeHandler = () => canvasWrapper.current && handleResize(canvasWrapper.current);
        window.addEventListener("resize", resizeHandler);
        return () => window.removeEventListener("resize", resizeHandler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canvasWrapper.current]);
    return (React.createElement(Dialog, { open: true, maxWidth: "sm", onClose: closeCanvas },
        React.createElement(MuiDialogTitle, { id: "sign-pad-dialog", className: classes.root },
            React.createElement(Typography, { variant: "h6" }, t("standalone.signature-pad.dialog.title")),
            closeCanvas && (React.createElement(IconButton, { "aria-label": "Close", className: classes.closeButton, onClick: closeCanvas, size: "large" },
                React.createElement(Close, null)))),
        React.createElement("div", { className: classes.signDiv, ref: setCanvasWrapperRef },
            !resetCanvas ? (React.createElement(SignaturePad, { ref: signCanvas, penColor: penColor || "blue", ...canvasProps, canvasProps: {
                    width: canvasSize[0],
                    height: canvasSize[1],
                } })) : (React.createElement("div", { className: classes.imageDiv },
                React.createElement("img", { src: signature, alt: "Sign" }))),
            React.createElement("div", { className: classes.hiddenDiv },
                React.createElement("input", { type: "text", value: signature ?? "", readOnly: true, ref: hiddenRef, name: props.name, onBlur: props.onBlur }))),
        React.createElement(DialogActions, null,
            React.createElement(Button, { onClick: saveCanvas, color: "primary" }, t("standalone.signature-pad.dialog.save-changes")),
            React.createElement(Button, { onClick: clearCanvas, color: "secondary" }, t("standalone.signature-pad.dialog.reset")))));
};
export const SignDialog = React.memo(SignPadDialog);
