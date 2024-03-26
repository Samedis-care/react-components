import React, { useCallback, useContext, useMemo } from "react";
import { BasicFormPageRendererProps } from "./BasicFormPage";
import { CrudFormProps } from "../CRUD";
import { useDialogContext } from "../../framework";
import { showConfirmDialog } from "../../non-standalone";
import { ActionButton, FormButtons } from "../../standalone";
import { IsInFormDialogContext } from "./FormDialog";
import useCCTranslations from "../../utils/useCCTranslations";
import { styled, Tooltip, useThemeProps } from "@mui/material";

export const BackActionButton = styled(ActionButton, {
	name: "CcDefaultFormPageButtons",
	slot: "backButton",
})({
	backgroundColor: "#bcbdbf",
	boxShadow: "none",
	border: "none",
	"&:hover": {
		boxShadow: "none",
		border: "none",
	},
});

export type DefaultFormPageButtonsClassKey = "backButton";
export type DefaultFormPageButtonsProps = BasicFormPageRendererProps<
	CrudFormProps | undefined
>;

const DefaultFormPageButtons = (inProps: DefaultFormPageButtonsProps) => {
	const props = useThemeProps({
		props: inProps,
		name: "CcDefaultFormPageButtons",
	});
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

	const humanReadOnlyReasons = useMemo(
		() => Object.values(readOnlyReasons).filter((e) => !!e) as string[],
		[readOnlyReasons],
	);

	return (
		<FormButtons>
			{!showBackButtonOnly &&
				(readOnly && humanReadOnlyReasons.length > 0 ? (
					<Tooltip title={humanReadOnlyReasons.join(", ")}>
						<span>{saveBtn}</span>
					</Tooltip>
				) : (
					saveBtn
				))}
			{goBack && !(isInDialog && hasCustomCloseHandler) && (
				<BackActionButton disabled={isSubmitting} onClick={handleBack}>
					{t("common.buttons.back")}
				</BackActionButton>
			)}
		</FormButtons>
	);
};

export default React.memo(DefaultFormPageButtons);
