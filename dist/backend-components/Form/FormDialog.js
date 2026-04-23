import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { Suspense, useCallback, useMemo, useRef, useState, } from "react";
import { Dialog, DialogContent, styled, useThemeProps } from "@mui/material";
import { OpenInNew } from "@mui/icons-material";
import { useDialogContext } from "../../framework/DialogContextProvider";
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
    const [pushDialog, popDialog] = useDialogContext();
    const blockClosingCounter = useRef(0);
    const [title, setTitle] = useState(null);
    const [openInNewLink, setOpenInNewLink] = useState(null);
    const [titlePriorityMode, setTitlePriorityMode] = useState("prop");
    const { t } = useCCTranslations();
    const handleClose = useCallback(async () => {
        try {
            if (blockClosingCounter.current > 0) {
                await showConfirmDialog(pushDialog, {
                    title: t("backend-components.form.back-on-dirty.title"),
                    message: t("backend-components.form.back-on-dirty.message"),
                    textButtonYes: t("backend-components.form.back-on-dirty.yes"),
                    textButtonNo: t("backend-components.form.back-on-dirty.no"),
                });
            }
            popDialog();
            if (onClose)
                onClose();
        }
        catch {
            // user cancelled
        }
    }, [t, onClose, popDialog, pushDialog]);
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
    return (_jsx(IsInFormDialogContext.Provider, { value: !disableFormDialogContext, children: _jsx(FormDialogDispatchContext.Provider, { value: dispatch, children: _jsx(Renderer, { ...props, onClose: handleClose, dialogTitle: dialogTitle, openInNewLink: openInNewLink ?? openInNewLinkOverride }) }) }));
};
export default React.memo(FormDialog);
