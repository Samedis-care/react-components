import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	BasicFormPageRendererProps,
	EnhancedCustomProps,
} from "./BasicFormPage";
import { CrudFormProps } from "../CRUD";
import { useDialogContext } from "../../framework";
import { showConfirmDialog } from "../../non-standalone";
import { ActionButton, FormButtons } from "../../standalone";
import { IsInFormDialogContext } from "./FormDialog";
import useCCTranslations from "../../utils/useCCTranslations";
import { styled, Tooltip, useThemeProps } from "@mui/material";
import { DefaultFormPageProps } from "./DefaultFormPage";

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
	EnhancedCustomProps<CrudFormProps> | undefined
> &
	Pick<
		DefaultFormPageProps,
		"extraButtons" | "textButtonSave" | "textButtonBack"
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
		autoBack,
		extraButtons,
	} = props;
	const goBack = customProps?.goBack;
	const hasCustomCloseHandler = customProps?.hasCustomSubmitHandler;
	const { t } = useCCTranslations();
	const isInDialog = useContext(IsInFormDialogContext);
	const [pushDialog] = useDialogContext();
	const displayConfirmDialog = !!confirmDialogMessage;

	const handleBack = useCallback(() => goBack && goBack(), [goBack]);
	const [autoBackTrigger, setAutoBackTrigger] = useState<null | number>(null);

	const submitWithConfirmDialog = useCallback(async () => {
		try {
			await showConfirmDialog(pushDialog, {
				title: t("common.dialogs.are-you-sure"),
				message:
					confirmDialogMessage ?? t("common.dialogs.are-you-sure-submit"),
				textButtonYes: t("common.buttons.yes"),
				textButtonNo: t("common.buttons.cancel"),
			});
		} catch {
			// user cancelled
			return;
		}

		try {
			await submit();
			if (autoBack) setAutoBackTrigger(Date.now());
		} catch {
			// ignore, error is shown regardless
		}
	}, [autoBack, confirmDialogMessage, pushDialog, submit, t]);

	const safeSubmit = useCallback(async () => {
		try {
			await submit();
			if (autoBack) setAutoBackTrigger(Date.now());
		} catch {
			// ignore, error is shown regardless
		}
	}, [autoBack, submit]);

	useEffect(() => {
		if (autoBackTrigger === null) return;
		void handleBack();
	}, [autoBackTrigger, handleBack]);

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
			{extraButtons}
			{goBack && !(isInDialog && hasCustomCloseHandler) && (
				<BackActionButton disabled={isSubmitting} onClick={handleBack}>
					{t("common.buttons.back")}
				</BackActionButton>
			)}
		</FormButtons>
	);
};

export default React.memo(DefaultFormPageButtons);
