import React, { useCallback, useContext, useEffect, useState } from "react";
import type {
	BasicFormPageRendererProps,
	EnhancedCustomProps,
} from "./BasicFormPage";
import type { CrudFormProps } from "../CRUD";
import { useDialogContext } from "../../framework";
import { showConfirmDialog } from "../../non-standalone";
// deep imports, not the standalone barrel: this module is reached through the Form
// barrel, and pulling the whole standalone barrel back in from here evaluates
// styled(ActionButton) before ActionButton's own module has finished
import ActionButton, {
	ActionButtonProps,
} from "../../standalone/UIKit/ActionButton";
import FormButtons from "../../standalone/UIKit/FormButtons";
import combineClassNames from "../../utils/combineClassNames";
import { IsInFormDialogContext } from "./FormDialog";
import useCCTranslations from "../../utils/useCCTranslations";
import { styled, useThemeProps } from "@mui/material";
import FormPageSaveButton from "./FormPageSaveButton";
import type { DefaultFormPageProps } from "./DefaultFormPage";

/**
 * Class BackActionButton sets when it gets no `color`. It paints the button in MUI's grey for a
 * contained button without a palette color (`grey[300]` in the light palette, `grey[800]` in the
 * dark one) with the palette's contrast text for that grey. Restyle it through
 * `CcDefaultFormPageButtons.styleOverrides.backButton`, and set `color` together with
 * `backgroundColor` there, or the text keeps the contrast color of the grey.
 */
export const BackButtonDefaultColorClass =
	"CcDefaultFormPageButtons-backButtonDefaultColor";

const BackActionButtonRoot = styled(ActionButton, {
	name: "CcDefaultFormPageButtons",
	slot: "backButton",
})(({ theme }) => {
	const background =
		theme.palette.mode === "light"
			? theme.palette.grey[300]
			: theme.palette.grey[800];
	return {
		[`&.${BackButtonDefaultColorClass}`]: {
			backgroundColor: background,
			color: theme.palette.getContrastText(background),
		},
		boxShadow: "none",
		border: "none",
		"&:hover": {
			boxShadow: "none",
			border: "none",
		},
	};
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

/**
 * ActionButton styled as the secondary "back" action of a form footer: no shadow, no border, and
 * grey (BackButtonDefaultColorClass) unless a `color` is given. Takes ActionButton's props.
 */
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
		dirty,
		isSubmitting,
		safeSubmit,
		customProps,
		confirmDialogMessage,
		autoBack,
		extraButtons,
		textButtonSave,
		textButtonBack,
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

	return (
		<FormButtons>
			{!showBackButtonOnly && (
				<FormPageSaveButton
					disabled={!dirty || isSubmitting || readOnly}
					onClick={
						displayConfirmDialog ? submitWithConfirmDialog : submitAndAutoBack
					}
				>
					{textButtonSave}
				</FormPageSaveButton>
			)}
			{extraButtons}
			{goBack && !(isInDialog && hasCustomCloseHandler) && (
				<BackActionButton disabled={isSubmitting} onClick={handleBack}>
					{textButtonBack ?? t("common.buttons.back")}
				</BackActionButton>
			)}
		</FormButtons>
	);
};

export default React.memo(DefaultFormPageButtons);
