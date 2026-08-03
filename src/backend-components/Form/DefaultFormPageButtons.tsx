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
import { ActionButtonProps } from "../../standalone/UIKit/ActionButton";
import combineClassNames from "../../utils/combineClassNames";
import { IsInFormDialogContext } from "./FormDialog";
import useCCTranslations from "../../utils/useCCTranslations";
import { styled, Tooltip, useThemeProps } from "@mui/material";
import { DefaultFormPageProps } from "./DefaultFormPage";

export const BackButtonDefaultColorClass =
	"CcDefaultFormPageButtons-backButtonDefaultColor";

const BackActionButtonRoot = styled(ActionButton, {
	name: "CcDefaultFormPageButtons",
	slot: "backButton",
})({
	[`&.${BackButtonDefaultColorClass}`]: {
		backgroundColor: "#bcbdbf",
	},
	boxShadow: "none",
	border: "none",
	"&:hover": {
		boxShadow: "none",
		border: "none",
	},
}) as typeof ActionButton;

const BackActionButtonInner = ({
	color,
	className,
	...props
}: ActionButtonProps) => (
	<BackActionButtonRoot
		color={color}
		className={combineClassNames([
			!color && BackButtonDefaultColorClass,
			className,
		])}
		{...props}
	/>
);

export const BackActionButton = React.memo(
	BackActionButtonInner,
) as typeof ActionButton;

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
		safeSubmit,
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

	const submitAndAutoBack = useCallback(async () => {
		if (!(await safeSubmit())) return; // error is shown and reported regardless
		if (autoBack) setAutoBackTrigger(Date.now());
	}, [autoBack, safeSubmit]);

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

		await submitAndAutoBack();
	}, [confirmDialogMessage, pushDialog, submitAndAutoBack, t]);

	useEffect(() => {
		if (autoBackTrigger === null) return;
		void handleBack();
	}, [autoBackTrigger, handleBack]);

	const saveBtn = (
		<ActionButton
			disabled={!dirty || isSubmitting || readOnly}
			onClick={
				displayConfirmDialog ? submitWithConfirmDialog : submitAndAutoBack
			}
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
