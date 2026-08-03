import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback } from "react";
import ActionButton from "../../../standalone/UIKit/ActionButton";
import { useFormContext } from "../Form";
import useCCTranslations from "../../../utils/useCCTranslations";
const FlowEngineSaveButton = (props) => {
    const { t } = useCCTranslations();
    const { dirty, submitting, readOnly, safeSubmit } = useFormContext();
    const disabled = !dirty || submitting || readOnly;
    const handleClick = useCallback(() => {
        void safeSubmit({ submitToServer: true });
    }, [safeSubmit]);
    return (_jsx(ActionButton, { onClick: handleClick, ...props, disabled: disabled || props.disabled, children: props.children ?? t("common.buttons.save") }));
};
export default React.memo(FlowEngineSaveButton);
