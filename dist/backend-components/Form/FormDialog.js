import React, { useCallback, useMemo, useRef } from "react";
import { Dialog, DialogContent } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { OpenInNew } from "@mui/icons-material";
import { useDialogContext } from "../../framework";
import { DialogTitle, showConfirmDialog } from "../../non-standalone";
import useCCTranslations from "../../utils/useCCTranslations";
const dialogStyles = makeStyles({
    content: {
        height: "80vh",
    },
    openInNewIcon: {
        verticalAlign: "middle",
        cursor: "pointer",
        marginLeft: 10,
    },
});
export const IsInFormDialogContext = React.createContext(false);
export const FormDialogDispatchContext = React.createContext(undefined);
const FormDialog = (props) => {
    const { dialogTitle, maxWidth, useCustomClasses, openInNewLink, children, onClose, disableFormDialogContext, } = props;
    const [pushDialog, popDialog] = useDialogContext();
    const classes = dialogStyles();
    const blockClosingCounter = useRef(0);
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
    }), [blockClosing, unblockClosing]);
    return (React.createElement(Dialog, { maxWidth: maxWidth ?? "lg", open: true, onClose: handleClose, fullWidth: true },
        React.createElement(DialogTitle, { onClose: handleClose, noTitle: !dialogTitle },
            dialogTitle,
            openInNewLink && (React.createElement(OpenInNew, { classes: { root: classes.openInNewIcon }, onClick: openInNewLink }))),
        React.createElement(DialogContent, { classes: useCustomClasses ? { root: classes.content } : undefined },
            React.createElement(IsInFormDialogContext.Provider, { value: !disableFormDialogContext },
                React.createElement(FormDialogDispatchContext.Provider, { value: dispatch }, children)))));
};
export default React.memo(FormDialog);
