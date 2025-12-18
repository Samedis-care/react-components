import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Dialog, DialogActions, IconButton, styled, useThemeProps, } from "@mui/material";
import MuiDialogTitle from "@mui/material/DialogTitle";
import { Close } from "@mui/icons-material";
import SignaturePad from "react-signature-pad-wrapper";
import { useDialogContext } from "../../framework";
import useCCTranslations from "../../utils/useCCTranslations";
import { showConfirmDialogBool } from "./Utils";
import combineClassNames from "../../utils/combineClassNames";
import trimCanvas from "trim-canvas";
const RootDialog = styled(Dialog, { name: "CcSignPadDialog", slot: "root" })({});
const StyledDialogTitle = styled(MuiDialogTitle, {
    name: "CcSignPadDialog",
    slot: "dialogTitle",
})(({ theme }) => ({
    margin: 0,
    padding: theme.spacing(2),
}));
const StyledCloseButton = styled(IconButton, {
    name: "CcSignPadDialog",
    slot: "closeButton",
})(({ theme }) => ({
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
}));
const SignDiv = styled("div", {
    name: "CcSignPadDialog",
    slot: "signDiv",
})({
    border: "1px dotted",
    marginLeft: 10,
    marginRight: 10,
    height: "min(calc(100vh - 192px), 300px)",
    width: "min(calc(100vw - 64px - 20px), 580px)",
});
const ImageDiv = styled("div", {
    name: "CcSignPadDialog",
    slot: "imageDiv",
})({
    width: 300,
    height: 150,
    display: "table-cell",
    verticalAlign: "middle",
    textAlign: "center",
});
const HiddenDiv = styled("div", {
    name: "CcSignPadDialog",
    slot: "hiddenDiv",
})({
    left: -500,
    position: "absolute",
});
const SignPadDialog = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcSignPadDialog" });
    const { t } = useCCTranslations();
    const { penColor, setSignature, signature, signerName: signerNameUntrim, classes, className, name, onBlur, } = props;
    const signerName = signerNameUntrim?.trim();
    const [resetCanvas, setResetCanvas] = useState(!!signature);
    const [pushDialog, popDialog] = useDialogContext();
    const canvasWrapper = useRef(null);
    const signCanvas = useRef(null);
    const hiddenRef = useRef(null);
    const [canvasSize, setCanvasSize] = useState([0, 0]);
    const clearCanvas = useCallback(async () => {
        if (!(await showConfirmDialogBool(pushDialog, {
            title: t("standalone.signature-pad.dialog.reset-confirm.title"),
            message: signerName
                ? t("standalone.signature-pad.dialog.reset-confirm.message-name", {
                    NAME: signerName,
                })
                : t("standalone.signature-pad.dialog.reset-confirm.message"),
            textButtonYes: t("standalone.signature-pad.dialog.reset-confirm.yes"),
            textButtonNo: t("standalone.signature-pad.dialog.reset-confirm.no"),
        }))) {
            return;
        }
        if (signCanvas.current) {
            signCanvas.current.clear();
        }
        setResetCanvas(false);
    }, [pushDialog, signerName, t]);
    const saveCanvas = useCallback(() => {
        if (signCanvas.current &&
            !signCanvas.current.isEmpty() &&
            signCanvas.current.canvas.current) {
            const canvas = signCanvas.current.canvas.current;
            const copy = document.createElement("canvas");
            copy.width = canvas.width;
            copy.height = canvas.height;
            copy.getContext("2d").drawImage(canvas, 0, 0);
            const newSignature = trimCanvas(copy).toDataURL("image/png");
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
    return (React.createElement(RootDialog, { open: true, maxWidth: "sm", onClose: closeCanvas, className: combineClassNames([className, classes?.root]) },
        React.createElement(StyledDialogTitle, { className: classes?.dialogTitle },
            signerName
                ? t("standalone.signature-pad.dialog.title-name", {
                    NAME: signerName,
                })
                : t("standalone.signature-pad.dialog.title"),
            closeCanvas && (React.createElement(StyledCloseButton, { "aria-label": t("standalone.signature-pad.dialog.close"), className: classes?.closeButton, onClick: closeCanvas, size: "large" },
                React.createElement(Close, null)))),
        React.createElement(SignDiv, { className: classes?.signDiv, ref: setCanvasWrapperRef, "data-name": name, onBlur: onBlur },
            !resetCanvas ? (React.createElement(SignaturePad, { ref: signCanvas, options: {
                    penColor: penColor || "blue",
                }, width: canvasSize[0], height: canvasSize[1] })) : (React.createElement(ImageDiv, { className: classes?.imageDiv },
                React.createElement("img", { src: signature, alt: t("standalone.signature-pad.dialog.signature") }))),
            React.createElement(HiddenDiv, { className: classes?.hiddenDiv },
                React.createElement("input", { type: "text", value: signature ?? "", readOnly: true, ref: hiddenRef, name: name, onBlur: onBlur }))),
        React.createElement(DialogActions, null,
            React.createElement(Button, { onClick: saveCanvas, color: "primary" }, t("standalone.signature-pad.dialog.save-changes")),
            React.createElement(Button, { onClick: clearCanvas, color: "error" }, t("standalone.signature-pad.dialog.reset")))));
};
export const SignDialog = React.memo(SignPadDialog);
