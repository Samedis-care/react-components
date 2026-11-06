import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback } from "react";
import { useFormContext } from "../Form";
import FormPageSaveButton from "../FormPageSaveButton";
const FlowEngineSaveButton = (props) => {
    const { dirty, submitting, readOnly, safeSubmit } = useFormContext();
    const disabled = !dirty || submitting || readOnly;
    const handleClick = useCallback(() => {
        void safeSubmit({ submitToServer: true });
    }, [safeSubmit]);
    return (_jsx(FormPageSaveButton, { onClick: handleClick, ...props, disabled: disabled || props.disabled }));
};
export default React.memo(FlowEngineSaveButton);
