import React, { useCallback } from "react";
import ActionButton, {
	ActionButtonProps,
} from "../../../standalone/UIKit/ActionButton";
import { useFormContext } from "../Form";
import useCCTranslations from "../../../utils/useCCTranslations";

export interface FlowEngineSaveButtonProps extends Omit<
	ActionButtonProps,
	"children"
> {
	children?: ActionButtonProps["children"];
}

const FlowEngineSaveButton = (props: FlowEngineSaveButtonProps) => {
	const { t } = useCCTranslations();
	const { dirty, submitting, readOnly, safeSubmit } = useFormContext();
	const disabled = !dirty || submitting || readOnly;

	const handleClick = useCallback(() => {
		void safeSubmit({ submitToServer: true });
	}, [safeSubmit]);

	return (
		<ActionButton
			onClick={handleClick}
			{...props}
			disabled={disabled || props.disabled}
		>
			{props.children ?? t("common.buttons.save")}
		</ActionButton>
	);
};

export default React.memo(FlowEngineSaveButton);
