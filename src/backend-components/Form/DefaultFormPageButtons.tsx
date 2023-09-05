import React, { useCallback, useContext } from "react";
import { BasicFormPageRendererProps } from "./BasicFormPage";
import makeStyles from "@mui/styles/makeStyles";
import { CrudFormProps } from "../CRUD";
import { useDialogContext } from "../../framework";
import { showConfirmDialog } from "../../non-standalone";
import { ActionButton, FormButtons } from "../../standalone";
import { IsInFormDialogContext } from "./FormDialog";
import useCCTranslations from "../../utils/useCCTranslations";
import { Tooltip } from "@mui/material";

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
		readOnly,
		readOnlyReasons,
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

	const handleBack = useCallback(() => goBack && goBack(), [goBack]);

	const saveBtn = (
		<ActionButton
			disabled={!dirty || isSubmitting || readOnly}
			onClick={displayConfirmDialog ? submitWithConfirmDialog : safeSubmit}
		>
			{t("common.buttons.save")}
		</ActionButton>
	);

	return (
		<FormButtons>
			{!showBackButtonOnly &&
				(readOnly && readOnlyReasons ? (
					<Tooltip title={readOnlyReasons.join(", ")}>
						<span>{saveBtn}</span>
					</Tooltip>
				) : (
					saveBtn
				))}
			{goBack && !(isInDialog && hasCustomCloseHandler) && (
				<ActionButton
					disabled={isSubmitting}
					onClick={handleBack}
					classes={backButtonClasses}
				>
					{t("common.buttons.back")}
				</ActionButton>
			)}
		</FormButtons>
	);
};

export default React.memo(DefaultFormPageButtons);
