import React, { Suspense, useCallback, useMemo, useRef, useState } from "react";
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
const FormDialog = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcFormDialog" });
    const { dialogTitle: titleOverride, maxWidth, fullWidth, useCustomClasses, openInNewLink, children, onClose, disableFormDialogContext, className, } = props;
    const [pushDialog, popDialog] = useDialogContext();
    const blockClosingCounter = useRef(0);
    const [title, setTitle] = useState(null);
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
        catch (e) {
            // user cancelled
        }
    }, [t, onClose, popDialog, pushDialog]);
    const blockClosing = useCallback(() => blockClosingCounter.current++, []);
    const unblockClosing = useCallback(() => blockClosingCounter.current--, []);
    const dispatch = useMemo(() => ({
        blockClosing,
        unblockClosing,
        setTitle,
    }), [blockClosing, unblockClosing]);
    const dialogTitle = titleOverride ?? title;
    const ContentComp = useCustomClasses ? TallDialogContent : DialogContent;
    return (React.createElement(Dialog, { maxWidth: maxWidth ?? "lg", open: true, onClose: handleClose, fullWidth: fullWidth ?? true, className: combineClassNames(["CcFormDialog", className]) },
        React.createElement(DialogTitle, { onClose: handleClose, noTitle: !dialogTitle },
            dialogTitle,
            openInNewLink && React.createElement(OpenInNewIcon, { onClick: openInNewLink })),
        React.createElement(ContentComp, null,
            React.createElement(IsInFormDialogContext.Provider, { value: !disableFormDialogContext },
                React.createElement(FormDialogDispatchContext.Provider, { value: dispatch },
                    React.createElement(Suspense, { fallback: React.createElement(Loader, null) }, children))))));
};
export default React.memo(FormDialog);
