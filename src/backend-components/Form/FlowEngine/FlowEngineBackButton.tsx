import React, { useCallback, useContext } from "react";
import { ActionButtonProps } from "../../../standalone/UIKit/ActionButton";
import { useFormContextLite } from "../Form";
import { BackActionButton } from "../DefaultFormPageButtons";
import { CrudFormProps } from "../../CRUD";
import useCCTranslations from "../../../utils/useCCTranslations";
import { IsInFormDialogContext } from "../FormDialog";

export interface FlowEngineBackButtonProps
	extends Omit<ActionButtonProps, "onClick" | "children"> {
	children?: ActionButtonProps["children"];
}

const FlowEngineBackButton = (props: FlowEngineBackButtonProps) => {
	const { customProps, submitting } = useFormContextLite();
	const custProps = customProps as CrudFormProps | undefined;
	const isInDialog = useContext(IsInFormDialogContext);
	const goBack = custProps?.goBack;
	const hasCustomCloseHandler = custProps?.hasCustomSubmitHandler;
	const { t } = useCCTranslations();

	const handleBack = useCallback(() => {
		if (goBack) goBack();
	}, [goBack]);

	return (
		<>
			{goBack && !(isInDialog && hasCustomCloseHandler) && (
				<BackActionButton
					{...props}
					disabled={props.disabled || submitting}
					onClick={handleBack}
				>
					{props.children ?? t("common.buttons.back")}
				</BackActionButton>
			)}
		</>
	);
};

export default React.memo(FlowEngineBackButton);
