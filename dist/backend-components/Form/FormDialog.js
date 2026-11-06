import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { Suspense, useCallback, useContext, useMemo, useRef, useState, } from "react";
import { Dialog, DialogContent, styled, useThemeProps } from "@mui/material";
import { OpenInNew } from "@mui/icons-material";
import { useDialogContext } from "../../framework/DialogContextProvider";
import { PushedDialogCloseContext, } from "../../framework/PushedDialogCloseContext";
import { captureError } from "../../framework/ErrorReporting";
import { showConfirmDialog } from "../../non-standalone/Dialog/Utils";
import { DialogTitle } from "../../non-standalone/Dialog/DialogTitle";
import useCCTranslations from "../../utils/useCCTranslations";
import Loader from "../../standalone/Loader";
import combineClassNames from "../../utils/combineClassNames";
const TallDialogContent = styled(DialogContent, {
    name: "CcFormDialog",
    slot: "content",
})({
    height: "80vh",
});
const OpenInNewIcon = styled(OpenInNew, {
    name: "CcFormDialog",
    slot: "openInNewIcon",
})({
    verticalAlign: "middle",
    cursor: "pointer",
    marginLeft: 10,
});
export const IsInFormDialogContext = React.createContext(false);
export const FormDialogDispatchContext = React.createContext(undefined);
export const FormDialogDefaultRenderer = (props) => {
    const { maxWidth, onClose, fullWidth, className, dialogTitle, openInNewLink, useCustomClasses, children, } = props;
    const ContentComp = useCustomClasses ? TallDialogContent : DialogContent;
    return (_jsxs(Dialog, { maxWidth: maxWidth ?? "lg", open: true, onClose: onClose, fullWidth: fullWidth ?? true, className: combineClassNames(["CcFormDialog", className]), children: [_jsxs(DialogTitle, { onClose: onClose, noTitle: !dialogTitle, children: [dialogTitle, openInNewLink && _jsx(OpenInNewIcon, { onClick: openInNewLink })] }), _jsx(ContentComp, { children: _jsx(Suspense, { fallback: _jsx(Loader, {}), children: children }) })] }));
};
const FormDialog = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcFormDialog" });
    const { dialogTitle: titleOverride, onClose, disableFormDialogContext, openInNewLink: openInNewLinkOverride, renderer, } = props;
    const [pushDialog] = useDialogContext();
    // not useCloseThisDialog, which throws: a FullFormDialog may be rendered without pushDialog,
    // then it closes through onClose. It is the pushed dialog when the nearest close comes from
    // pushDialog; inside another FullFormDialog's content it was rendered without pushDialog.
    const outerClose = useContext(PushedDialogCloseContext);
    const closeThisDialog = outerClose?.pushed ? outerClose.close : null;
    const blockClosingCounter = useRef(0);
    const [title, setTitle] = useState(null);
    const [openInNewLink, setOpenInNewLink] = useState(null);
    const [titlePriorityMode, setTitlePriorityMode] = useState("prop");
    const { t } = useCCTranslations();
    const handleClose = useCallback(async () => {
        if (blockClosingCounter.current > 0) {
            try {
                await showConfirmDialog(pushDialog, {
                    title: t("backend-components.form.back-on-dirty.title"),
                    message: t("backend-components.form.back-on-dirty.message"),
                    textButtonYes: t("backend-components.form.back-on-dirty.yes"),
                    textButtonNo: t("backend-components.form.back-on-dirty.no"),
                });
            }
            catch {
                return; // user cancelled
            }
        }
        if (!closeThisDialog && !onClose) {
            // eslint-disable-next-line no-console
            console.error(new Error("[Components-Care] FullFormDialog: rendered without pushDialog and without onClose, so it cannot be closed. Show it with pushDialog, or pass an onClose that stops rendering it."));
            return;
        }
        // onClose first: it may close the dialog itself (onClose={popDialog}, or the state of a
        // dialog rendered without pushDialog), and closing this dialog again does nothing
        try {
            onClose?.();
        }
        catch (e) {
            captureError(e, { source: "FullFormDialog.onClose" });
            // eslint-disable-next-line no-console
            console.error("[Components-Care] [FullFormDialog] onClose threw", e);
        }
        closeThisDialog?.();
    }, [t, onClose, closeThisDialog, pushDialog]);
    const blockClosing = useCallback(() => blockClosingCounter.current++, []);
    const unblockClosing = useCallback(() => blockClosingCounter.current--, []);
    const dispatch = useMemo(() => ({
        blockClosing,
        unblockClosing,
        setTitle,
        setOpenInNewLink,
        setTitlePriorityMode,
    }), [blockClosing, unblockClosing]);
    const dialogTitle = titlePriorityMode === "dispatch"
        ? (title ?? titleOverride)
        : (titleOverride ?? title);
    const Renderer = renderer ?? FormDialogDefaultRenderer;
    // the content's useCloseThisDialog closes this dialog; a FullFormDialog rendered in the
    // content without pushDialog sees pushed: false and closes through its own onClose
    const contentClose = useMemo(() => closeThisDialog ? { close: closeThisDialog, pushed: false } : null, [closeThisDialog]);
    return (_jsx(IsInFormDialogContext.Provider, { value: !disableFormDialogContext, children: _jsx(FormDialogDispatchContext.Provider, { value: dispatch, children: _jsx(PushedDialogCloseContext.Provider, { value: contentClose, children: _jsx(Renderer, { ...props, onClose: handleClose, dialogTitle: dialogTitle, openInNewLink: openInNewLink ?? openInNewLinkOverride }) }) }) }));
};
export default React.memo(FormDialog);
