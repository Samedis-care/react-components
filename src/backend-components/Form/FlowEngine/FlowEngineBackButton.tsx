import React, { useCallback, useContext } from "react";
import { ActionButtonProps } from "../../../standalone/UIKit/ActionButton";
import { useFormContextLite } from "../Form";
import { BackActionButton } from "../DefaultFormPageButtons";
import { CrudFormProps } from "../../CRUD";
import useCCTranslations from "../../../utils/useCCTranslations";
import { IsInFormDialogContext } from "../FormDialog";
import { EnhancedCustomProps } from "../BasicFormPage";
import { ModelUnknown } from "../../../backend-integration";

export interface FlowEngineBackButtonProps extends Omit<
	ActionButtonProps,
	"onClick" | "children"
> {
	/**
	 * The label
	 * @default the translated "Cancel" (common.buttons.cancel): the button leaves the whole
	 *          flow, not only the current stage
	 */
	children?: ActionButtonProps["children"];
}

export const useShouldRenderFlowEngineBackButton = () => {
	const { customProps } = useFormContextLite<ModelUnknown>();
	const custProps = customProps as
		EnhancedCustomProps<CrudFormProps> | undefined;
	const isInDialog = useContext(IsInFormDialogContext);
	const goBack = custProps?.goBack;
	const hasCustomCloseHandler = custProps?.hasCustomSubmitHandler;
	return goBack && !(isInDialog && hasCustomCloseHandler);
};

/**
 * back button with same logic as DefaultFormPage back button
 * @remarks Should only be rendered if useShouldRenderFlowEngineBackButton() returns true
 * @param props The props
 */
const FlowEngineBackButton = (props: FlowEngineBackButtonProps) => {
	const { customProps, submitting } = useFormContextLite<ModelUnknown>();
	const custProps = customProps as
		EnhancedCustomProps<CrudFormProps> | undefined;
	const isInDialog = useContext(IsInFormDialogContext);
	const goBack = custProps?.goBack;
	const hasCustomCloseHandler = custProps?.hasCustomSubmitHandler;
	const { t } = useCCTranslations();

	const handleBack = useCallback(() => {
		if (goBack) void goBack();
	}, [goBack]);

	return (
		<>
			{goBack && !(isInDialog && hasCustomCloseHandler) && (
				<BackActionButton
					{...props}
					disabled={props.disabled || submitting}
					onClick={handleBack}
				>
					{props.children ?? t("common.buttons.cancel")}
				</BackActionButton>
			)}
		</>
	);
};

export default React.memo(FlowEngineBackButton);
