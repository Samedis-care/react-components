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
 * Disabled while the form is not dirty, is saving or is read-only; the `disabled` prop can
 * only disable it further. An `onClick` replaces the save and keeps that disabled rule
 * (apps use it as a Next or Done button).
 * @remarks It reads the Form's lite context, so typing in a field does not render it again
 *          while dirty, saving and read-only stay the same.
 */
const FlowEngineSaveButton = (props: FlowEngineSaveButtonProps) => {
	const { dirty, submitting, readOnly, safeSubmit } =
		useFormContextLite<ModelUnknown>();
	const disabled = !dirty || submitting || readOnly;

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
