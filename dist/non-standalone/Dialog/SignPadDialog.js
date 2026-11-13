import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useContext, useRef, useState } from "react";
import { Button, Dialog, DialogActions, IconButton, styled, useThemeProps, } from "@mui/material";
import MuiDialogTitle from "@mui/material/DialogTitle";
import { Close } from "@mui/icons-material";
import SignaturePad from "react-signature-pad-wrapper";
import { useDialogContext } from "../../framework";
import { PushedDialogCloseContext } from "../../framework/PushedDialogCloseContext";
import useCCTranslations from "../../utils/useCCTranslations";
import { showConfirmDialogBool } from "./Utils";
import combineClassNames from "../../utils/combineClassNames";
import trimCanvas from "trim-canvas";
import { isTouchDevice } from "../../utils";
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
    "& > canvas": {
        width: "100%",
        height: "100%",
        objectFit: "contain",
    },
});
// fills the sign area, as the canvas does; the padding keeps the scaled ink off
// the dotted border
const ImageDiv = styled("div", {
    name: "CcSignPadDialog",
    slot: "imageDiv",
})(({ theme }) => ({
    boxSizing: "border-box",
    width: "100%",
    height: "100%",
    padding: theme.spacing(1),
}));
// the stored PNG's pixel size depends on the signing device (CSS size times
// devicePixelRatio, cropped to the ink): scale it to fit and center it, as the
// tile does
const SignatureImage = styled("img", {
    name: "CcSignPadDialog",
    slot: "signatureImage",
})({
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "contain",
});
const HiddenDiv = styled("div", {
    name: "CcSignPadDialog",
    slot: "hiddenDiv",
})({
    left: -500,
    position: "absolute",
});
/**
 * Whether a canvas cropped by trim-canvas holds no ink. trim-canvas crops to
 * the non-transparent pixels and leaves a single transparent pixel when there
 * are none.
 * @param trimmed The canvas trim-canvas returned
 * @returns true when the canvas holds no ink
 */
const isBlankTrim = (trimmed) => trimmed.width === 1 &&
    trimmed.height === 1 &&
    trimmed.getContext("2d")?.getImageData(0, 0, 1, 1).data[3] === 0;
const SignPadDialog = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcSignPadDialog" });
    const { t } = useCCTranslations();
    const { penColor, setSignature, signature, signerName: signerNameUntrim, classes, className, name, onBlur, } = props;
    const signerName = signerNameUntrim?.trim();
    const [resetCanvas, setResetCanvas] = useState(!!signature);
    const [pushDialog] = useDialogContext();
    // not useCloseThisDialog, which throws: rendered without pushDialog, there is no dialog
    // to close (SignDialog has no onClose)
    const pushedClose = useContext(PushedDialogCloseContext);
    const closeThisDialog = pushedClose?.pushed ? pushedClose.close : null;
    const signCanvas = useRef(null);
    const hiddenRef = useRef(null);
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
            const trimmed = trimCanvas(copy);
            // isEmpty() counts strokes, not pixels: a canvas whose bitmap was
            // lost still has its strokes, and must not save a blank image
            const newSignature = isBlankTrim(trimmed)
                ? ""
                : trimmed.toDataURL("image/png");
            if (setSignature)
                setSignature(newSignature);
        }
        else {
            if (setSignature)
                setSignature(resetCanvas ? (signature ?? "") : "");
        }
        hiddenRef.current?.focus();
        hiddenRef.current?.blur();
        closeThisDialog?.();
    }, [setSignature, closeThisDialog, signature, resetCanvas]);
    const closeCanvas = useCallback((_, reason) => {
        if (reason === "backdropClick" && isTouchDevice())
            return; // prevent accidential close by hand palm when signing with pen
        hiddenRef.current?.focus();
        hiddenRef.current?.blur();
        closeThisDialog?.();
    }, [closeThisDialog]);
    const closeCanvasBtn = useCallback(() => closeCanvas({}, "closeBtn"), [closeCanvas]);
    return (_jsxs(RootDialog, { open: true, maxWidth: "sm", onClose: closeCanvas, className: combineClassNames([className, classes?.root]), children: [_jsxs(StyledDialogTitle, { className: classes?.dialogTitle, children: [signerName
                        ? t("standalone.signature-pad.dialog.title-name", {
                            NAME: signerName,
                        })
                        : t("standalone.signature-pad.dialog.title"), _jsx(StyledCloseButton, { "aria-label": t("standalone.signature-pad.dialog.close"), className: classes?.closeButton, onClick: closeCanvasBtn, size: "large", children: _jsx(Close, {}) })] }), _jsxs(SignDiv, { className: classes?.signDiv, "data-name": name, onBlur: onBlur, children: [!resetCanvas ? (_jsx(SignaturePad, { ref: signCanvas, options: {
                            penColor: penColor || "blue",
                        }, 
                        // no width or height: the wrapper reads them only on mount.
                        // Without them it sizes the bitmap to the canvas's box (the
                        // sign area) times devicePixelRatio, on mount and on every
                        // window resize, so the ink lands under the pen.
                        // Re-dimensioning the canvas clears its bitmap: draw the
                        // strokes again, so the ink survives a resize
                        redrawOnResize: true })) : (_jsx(ImageDiv, { className: classes?.imageDiv, children: _jsx(SignatureImage, { src: signature ?? undefined, alt: t("standalone.signature-pad.dialog.signature") }) })), _jsx(HiddenDiv, { className: classes?.hiddenDiv, children: _jsx("input", { type: "text", value: signature ?? "", readOnly: true, ref: hiddenRef, name: name, onBlur: onBlur }) })] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: saveCanvas, color: "primary", children: t("standalone.signature-pad.dialog.save-changes") }), _jsx(Button, { onClick: clearCanvas, color: "error", children: t("standalone.signature-pad.dialog.reset") })] })] }));
};
export const SignDialog = React.memo(SignPadDialog);
