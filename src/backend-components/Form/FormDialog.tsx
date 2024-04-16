import React, { useCallback, useMemo, useRef } from "react";
import { Dialog, DialogContent, styled, useThemeProps } from "@mui/material";
import { OpenInNew } from "@mui/icons-material";
import { useDialogContext } from "../../framework/DialogContextProvider";
import { showConfirmDialog } from "../../non-standalone/Dialog/Utils";
import { DialogTitle } from "../../non-standalone/Dialog/DialogTitle";
import useCCTranslations from "../../utils/useCCTranslations";

export interface FormDialogProps {
	/**
	 * Dialog tille
	 */
	dialogTitle?: React.ReactNode;
	/**
	 * Dialog width optional parameter
	 */
	maxWidth?: false | "lg" | "xs" | "sm" | "md" | "xl" | undefined;
	/**
	 * Boolean flag to use custom classes
	 */
	useCustomClasses?: boolean;
	/**
	 * Add link button option
	 */
	openInNewLink?: () => void;
	/**
	 * Dialog contents
	 */
	children?: React.ReactNode;
	/**
	 * Called on dialog close
	 */
	onClose?: () => void;
	/**
	 * Disable automatic special handling of form dialog. Use if form dialog is only used as layout/design component
	 */
	disableFormDialogContext?: boolean;
}

const TallDialogContent = styled(DialogContent, {
	name: "CcFormDialog",
	slot: "content",
})({
	height: "80vh",
});

const OpenInNewIcon = styled(OpenInNew, {
	name: "CcFormDialog",
	slot: "openInNewIcon",
})({
	verticalAlign: "middle",
	cursor: "pointer",
	marginLeft: 10,
});

export type FormDialogClassKey = "content" | "openInNewIcon";

export interface FormDialogDispatch {
	blockClosing: () => void;
	unblockClosing: () => void;
}

export const IsInFormDialogContext = React.createContext(false);
export const FormDialogDispatchContext = React.createContext<
	FormDialogDispatch | undefined
>(undefined);

const FormDialog = (inProps: FormDialogProps) => {
	const props = useThemeProps({ props: inProps, name: "CcFormDialog" });
	const {
		dialogTitle,
		maxWidth,
		useCustomClasses,
		openInNewLink,
		children,
		onClose,
		disableFormDialogContext,
	} = props;
	const [pushDialog, popDialog] = useDialogContext();
	const blockClosingCounter = useRef(0);
	const { t } = useCCTranslations();

	const handleClose = useCallback(async () => {
		try {
			if (blockClosingCounter.current > 0) {
				await showConfirmDialog(pushDialog, {
					title: t("backend-components.form.back-on-dirty.title"),
					message: t("backend-components.form.back-on-dirty.message"),
					textButtonYes: t("backend-components.form.back-on-dirty.yes"),
					textButtonNo: t("backend-components.form.back-on-dirty.no"),
				});
			}

			popDialog();
			if (onClose) onClose();
		} catch (e) {
			// user cancelled
		}
	}, [t, onClose, popDialog, pushDialog]);

	const blockClosing = useCallback(() => blockClosingCounter.current++, []);
	const unblockClosing = useCallback(() => blockClosingCounter.current--, []);
	const dispatch = useMemo(
		(): FormDialogDispatch => ({
			blockClosing,
			unblockClosing,
		}),
		[blockClosing, unblockClosing],
	);

	const ContentComp = useCustomClasses ? TallDialogContent : DialogContent;

	return (
		<Dialog
			maxWidth={maxWidth ?? "lg"}
			open={true}
			onClose={handleClose}
			fullWidth
			className={"CcFormDialog"}
		>
			<DialogTitle onClose={handleClose} noTitle={!dialogTitle}>
				{dialogTitle}
				{openInNewLink && <OpenInNewIcon onClick={openInNewLink} />}
			</DialogTitle>
			<ContentComp>
				<IsInFormDialogContext.Provider value={!disableFormDialogContext}>
					<FormDialogDispatchContext.Provider value={dispatch}>
						{children}
					</FormDialogDispatchContext.Provider>
				</IsInFormDialogContext.Provider>
			</ContentComp>
		</Dialog>
	);
};

export default React.memo(FormDialog);
