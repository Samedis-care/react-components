import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback } from "react";
import { useFormContextLite } from "../Form";
import FormPageSaveButton from "../FormPageSaveButton";
/**
 * Save button of a flow stage: saves what every stage staged and stays on the stage
 * (`safeSubmit({ submitToServer: true })`; the Form's errorComponent shows a failure).
 *
 * Disabled while the form is not dirty, is saving or is read-only; the `disabled` prop can
 * only disable it further. An `onClick` replaces the save and keeps that disabled rule
 * (apps use it as a Next or Done button).
 * @remarks It reads the Form's lite context, so typing in a field does not render it again
 *          while dirty, saving and read-only stay the same.
 */
const FlowEngineSaveButton = (props) => {
    const { dirty, submitting, readOnly, safeSubmit } = useFormContextLite();
    const disabled = !dirty || submitting || readOnly;
    const handleClick = useCallback(() => {
        void safeSubmit({ submitToServer: true });
    }, [safeSubmit]);
    return (_jsx(FormPageSaveButton, { onClick: handleClick, ...props, disabled: disabled || props.disabled }));
};
export default React.memo(FlowEngineSaveButton);
