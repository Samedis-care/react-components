import React, { useCallback } from "react";
import { ActionButtonProps } from "../../../standalone/UIKit/ActionButton";
import { useFormContext } from "../Form";
import FormPageSaveButton from "../FormPageSaveButton";
import { ModelUnknown } from "../../../backend-integration";

export interface FlowEngineSaveButtonProps extends Omit<
	ActionButtonProps,
	"children"
> {
	children?: ActionButtonProps["children"];
}

const FlowEngineSaveButton = (props: FlowEngineSaveButtonProps) => {
	const { dirty, submitting, readOnly, safeSubmit } =
		useFormContext<ModelUnknown>();
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
