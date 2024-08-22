import React, { useCallback } from "react";
import ActionButton from "../../../standalone/UIKit/ActionButton";
import { useFormContext } from "../Form";
import useCCTranslations from "../../../utils/useCCTranslations";
const FlowEngineSaveButton = (props) => {
    const { t } = useCCTranslations();
    const { dirty, submitting, readOnly, submit } = useFormContext();
    const disabled = !dirty || submitting || readOnly;
    const safeSubmit = useCallback(async () => {
        try {
            await submit({ submitToServer: true });
        }
        catch {
            // ignore, error is shown regardless
        }
    }, [submit]);
    return (React.createElement(ActionButton, { onClick: safeSubmit, ...props, disabled: disabled || props.disabled }, props.children ?? t("common.buttons.save")));
};
export default React.memo(FlowEngineSaveButton);
