import React, { useCallback } from "react";
import { ActionButtonProps } from "../../../standalone/UIKit/ActionButton";
import { useFormContextLite } from "../Form";
import FormPageSaveButton from "../FormPageSaveButton";
import { ModelUnknown } from "../../../backend-integration";

/**
 * Props of FlowEngineSaveButton: ActionButton's, with an optional label
 */
export interface FlowEngineSaveButtonProps extends Omit<
	ActionButtonProps,
	"children"
> {
	/**
	 * The label
	 * @default the translated "Save" (common.buttons.save)
	 */
	children?: ActionButtonProps["children"];
}

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
const FlowEngineSaveButton = (props: FlowEngineSaveButtonProps) => {
	const { dirty, stagedDirty, submitting, readOnly, safeSubmit } =
		useFormContextLite<ModelUnknown>();
	const disabled = !(dirty || stagedDirty) || submitting || readOnly;

	const handleClick = useCallback(() => {
		void safeSubmit({ submitToServer: true });
	}, [safeSubmit]);

	return (
		<FormPageSaveButton
			onClick={handleClick}
			{...props}
			disabled={disabled || props.disabled}
		/>
	);
};

export default React.memo(FlowEngineSaveButton);
