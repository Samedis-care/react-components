import React, { useCallback, useContext, useMemo } from "react";
import makeStyles from "@mui/styles/makeStyles";
import { useDialogContext } from "../../framework";
import { showConfirmDialog } from "../../non-standalone";
import { ActionButton, FormButtons } from "../../standalone";
import { IsInFormDialogContext } from "./FormDialog";
import useCCTranslations from "../../utils/useCCTranslations";
import { Tooltip } from "@mui/material";
export const useBackButtonStyles = makeStyles({
    root: {
        backgroundColor: "#bcbdbf",
        boxShadow: "none",
        border: "none",
        "&:hover": {
            boxShadow: "none",
            border: "none",
        },
    },
});
const DefaultFormPageButtons = (props) => {
    const { showBackButtonOnly, readOnly, readOnlyReasons, dirty, isSubmitting, submit, customProps, confirmDialogMessage, } = props;
    const goBack = customProps?.goBack;
    const hasCustomCloseHandler = customProps?.hasCustomSubmitHandler;
    const { t } = useCCTranslations();
    const backButtonClasses = useBackButtonStyles();
    const isInDialog = useContext(IsInFormDialogContext);
    const [pushDialog] = useDialogContext();
    const displayConfirmDialog = !!confirmDialogMessage;
    const submitWithConfirmDialog = useCallback(async () => {
        try {
            await showConfirmDialog(pushDialog, {
                title: t("common.dialogs.are-you-sure"),
                message: confirmDialogMessage ?? t("common.dialogs.are-you-sure-submit"),
                textButtonYes: t("common.buttons.yes"),
                textButtonNo: t("common.buttons.cancel"),
            });
        }
        catch (error) {
            // user cancelled
            return;
        }
        try {
            await submit();
        }
        catch (e) {
            // ignore, error is shown regardless
        }
    }, [confirmDialogMessage, pushDialog, submit, t]);
    const safeSubmit = useCallback(async () => {
        try {
            await submit();
        }
        catch (e) {
            // ignore, error is shown regardless
        }
    }, [submit]);
    const handleBack = useCallback(() => goBack && goBack(), [goBack]);
    const saveBtn = (React.createElement(ActionButton, { disabled: !dirty || isSubmitting || readOnly, onClick: displayConfirmDialog ? submitWithConfirmDialog : safeSubmit }, t("common.buttons.save")));
    const humanReadOnlyReasons = useMemo(() => Object.values(readOnlyReasons).filter((e) => !!e), [readOnlyReasons]);
    return (React.createElement(FormButtons, null,
        !showBackButtonOnly &&
            (readOnly && humanReadOnlyReasons.length > 0 ? (React.createElement(Tooltip, { title: humanReadOnlyReasons.join(", ") },
                React.createElement("span", null, saveBtn))) : (saveBtn)),
        goBack && !(isInDialog && hasCustomCloseHandler) && (React.createElement(ActionButton, { disabled: isSubmitting, onClick: handleBack, classes: backButtonClasses }, t("common.buttons.back")))));
};
export default React.memo(DefaultFormPageButtons);
