import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useContext, useEffect, useMemo, useState, } from "react";
import { useDialogContext } from "../../framework";
import { showConfirmDialog } from "../../non-standalone";
import { ActionButton, FormButtons } from "../../standalone";
import combineClassNames from "../../utils/combineClassNames";
import { IsInFormDialogContext } from "./FormDialog";
import useCCTranslations from "../../utils/useCCTranslations";
import { styled, Tooltip, useThemeProps } from "@mui/material";
export const BackButtonDefaultColorClass = "CcDefaultFormPageButtons-backButtonDefaultColor";
const BackActionButtonRoot = styled(ActionButton, {
    name: "CcDefaultFormPageButtons",
    slot: "backButton",
})({
    [`&.${BackButtonDefaultColorClass}`]: {
        backgroundColor: "#bcbdbf",
    },
    boxShadow: "none",
    border: "none",
    "&:hover": {
        boxShadow: "none",
        border: "none",
    },
});
const BackActionButtonInner = ({ color, className, ...props }) => (_jsx(BackActionButtonRoot, { color: color, className: combineClassNames([
        !color && BackButtonDefaultColorClass,
        className,
    ]), ...props }));
export const BackActionButton = React.memo(BackActionButtonInner);
const DefaultFormPageButtons = (inProps) => {
    const props = useThemeProps({
        props: inProps,
        name: "CcDefaultFormPageButtons",
    });
    const { showBackButtonOnly, readOnly, readOnlyReasons, dirty, isSubmitting, submit, customProps, confirmDialogMessage, autoBack, extraButtons, } = props;
    const goBack = customProps?.goBack;
    const hasCustomCloseHandler = customProps?.hasCustomSubmitHandler;
    const { t } = useCCTranslations();
    const isInDialog = useContext(IsInFormDialogContext);
    const [pushDialog] = useDialogContext();
    const displayConfirmDialog = !!confirmDialogMessage;
    const handleBack = useCallback(() => goBack && goBack(), [goBack]);
    const [autoBackTrigger, setAutoBackTrigger] = useState(null);
    const submitWithConfirmDialog = useCallback(async () => {
        try {
            await showConfirmDialog(pushDialog, {
                title: t("common.dialogs.are-you-sure"),
                message: confirmDialogMessage ?? t("common.dialogs.are-you-sure-submit"),
                textButtonYes: t("common.buttons.yes"),
                textButtonNo: t("common.buttons.cancel"),
            });
        }
        catch {
            // user cancelled
            return;
        }
        try {
            await submit();
            if (autoBack)
                setAutoBackTrigger(Date.now());
        }
        catch {
            // ignore, error is shown regardless
        }
    }, [autoBack, confirmDialogMessage, pushDialog, submit, t]);
    const safeSubmit = useCallback(async () => {
        try {
            await submit();
            if (autoBack)
                setAutoBackTrigger(Date.now());
        }
        catch {
            // ignore, error is shown regardless
        }
    }, [autoBack, submit]);
    useEffect(() => {
        if (autoBackTrigger === null)
            return;
        void handleBack();
    }, [autoBackTrigger, handleBack]);
    const saveBtn = (_jsx(ActionButton, { disabled: !dirty || isSubmitting || readOnly, onClick: displayConfirmDialog ? submitWithConfirmDialog : safeSubmit, children: t("common.buttons.save") }));
    const humanReadOnlyReasons = useMemo(() => Object.values(readOnlyReasons).filter((e) => !!e), [readOnlyReasons]);
    return (_jsxs(FormButtons, { children: [!showBackButtonOnly &&
                (readOnly && humanReadOnlyReasons.length > 0 ? (_jsx(Tooltip, { title: humanReadOnlyReasons.join(", "), children: _jsx("span", { children: saveBtn }) })) : (saveBtn)), extraButtons, goBack && !(isInDialog && hasCustomCloseHandler) && (_jsx(BackActionButton, { disabled: isSubmitting, onClick: handleBack, children: t("common.buttons.back") }))] }));
};
export default React.memo(DefaultFormPageButtons);
