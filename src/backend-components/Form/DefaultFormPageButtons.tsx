import React, { useCallback, useContext } from "react";
import { BasicFormPageRendererProps } from "./BasicFormPage";
import { makeStyles } from "@material-ui/core/styles";
import { CrudFormProps } from "../CRUD";
import { useDialogContext } from "../../framework";
import { showConfirmDialog } from "../../non-standalone";
import { ActionButton, FormButtons } from "../../standalone";
import { IsInFormDialogContext } from "./FormDialog";
import useCCTranslations from "../../utils/useCCTranslations";

export const useBackButtonStyles = makeStyles({
	root: {
		backgroundColor: "#bcbdbf",
		boxShadow: "none",
		border: "none",
		"&:hover": {
			boxShadow: "none",
			border: "none",
		},
	},
});

const DefaultFormPageButtons = (
	props: BasicFormPageRendererProps<CrudFormProps | undefined>
) => {
	const {
		showBackButtonOnly,
		dirty,
		isSubmitting,
		submit,
		customProps,
		confirmDialogMessage,
	} = props;
	const goBack = customProps?.goBack;
	const hasCustomCloseHandler = customProps?.hasCustomSubmitHandler;
	const { t } = useCCTranslations();
	const backButtonClasses = useBackButtonStyles();
	const isInDialog = useContext(IsInFormDialogContext);
	const [pushDialog] = useDialogContext();
	const displayConfirmDialog = !!confirmDialogMessage;

	const submitWithConfirmDialog = useCallback(async () => {
		try {
			await showConfirmDialog(pushDialog, {
				title: t("common.dialogs.are-you-sure"),
				message:
					confirmDialogMessage ?? t("common.dialogs.are-you-sure-submit"),
				textButtonYes: t("common.buttons.yes"),
				textButtonNo: t("common.buttons.cancel"),
			});
		} catch (error) {
			// user cancelled
			return;
		}

		try {
			await submit();
		} catch (e) {
			// ignore, error is shown regardless
		}
	}, [confirmDialogMessage, pushDialog, submit, t]);

	const safeSubmit = useCallback(async () => {
		try {
			await submit();
		} catch (e) {
			// ignore, error is shown regardless
		}
	}, [submit]);

	return (
		<FormButtons>
			{!showBackButtonOnly && (
				<ActionButton
					disabled={!dirty || isSubmitting}
					onClick={displayConfirmDialog ? submitWithConfirmDialog : safeSubmit}
				>
					{t("common.buttons.save")}
				</ActionButton>
			)}
			{goBack && !(isInDialog && hasCustomCloseHandler) && (
				<ActionButton
					disabled={isSubmitting}
					onClick={goBack}
					classes={backButtonClasses}
				>
					{t("common.buttons.back")}
				</ActionButton>
			)}
		</FormButtons>
	);
};

export default React.memo(DefaultFormPageButtons);
