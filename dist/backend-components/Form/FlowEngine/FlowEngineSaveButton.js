import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback } from "react";
import { useFormContextLite } from "../Form";
import FormPageSaveButton from "../FormPageSaveButton";
/**
 * Save button of a flow stage: saves what every stage staged and stays on the stage
 * (`safeSubmit({ submitToServer: true })`; the Form's errorComponent shows a failure).
 *
 * Disabled while the form has nothing to save (neither `dirty` nor `stagedDirty`: the save
 * sends the shown stage's values and what earlier stages staged), is saving or is
 * read-only; the `disabled` prop can only disable it further. An `onClick` replaces the
 * save and keeps that disabled rule, for a button that saves in its own way (a Done
 * button). A button that goes on to the next stage without saving (Next) follows `dirty`
 * alone, the shown stage's values: build it from an ActionButton, or pass
 * `disabled={!dirty}` here.
 * @remarks It reads the Form's lite context, so typing in a field does not render it again
 *          while dirty, stagedDirty, saving and read-only stay the same.
 * @see FormContextData.stagedDirty
 */
const FlowEngineSaveButton = (props) => {
    const { dirty, stagedDirty, submitting, readOnly, safeSubmit } = useFormContextLite();
    const disabled = !(dirty || stagedDirty) || submitting || readOnly;
    const handleClick = useCallback(() => {
        void safeSubmit({ submitToServer: true });
    }, [safeSubmit]);
    return (_jsx(FormPageSaveButton, { onClick: handleClick, ...props, disabled: disabled || props.disabled }));
};
export default React.memo(FlowEngineSaveButton);
