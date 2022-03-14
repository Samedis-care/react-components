import React, { useCallback, useMemo, useRef } from "react";
import { Dialog, DialogContent, makeStyles } from "@material-ui/core";
import { OpenInNew } from "@material-ui/icons";
import { useDialogContext } from "../../framework";
import { DialogTitle, showConfirmDialog } from "../../non-standalone";
import useCCTranslations from "../../utils/useCCTranslations";

export interface FormDialogProps {
	/**
	 * Dialog tille
	 */
	dialogTitle?: string;
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
}

const dialogStyles = makeStyles({
	content: {
		height: "80vh",
	},
	openInNewIcon: {
		verticalAlign: "middle",
		cursor: "pointer",
		marginLeft: 10,
	},
});

export interface FormDialogDispatch {
	blockClosing: () => void;
	unblockClosing: () => void;
}

export const IsInFormDialogContext = React.createContext(false);
export const FormDialogDispatchContext = React.createContext<
	FormDialogDispatch | undefined
>(undefined);

const FormDialog = (props: FormDialogProps) => {
	const {
		dialogTitle,
		maxWidth,
		useCustomClasses,
		openInNewLink,
		children,
		onClose,
	} = props;
	const [pushDialog, popDialog] = useDialogContext();
	const classes = dialogStyles();
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
		[blockClosing, unblockClosing]
	);

	return (
		<Dialog
			maxWidth={maxWidth ?? "lg"}
			open={true}
			onClose={handleClose}
			fullWidth
			disableBackdropClick
		>
			<DialogTitle onClose={handleClose} noTitle={!dialogTitle}>
				{dialogTitle}
				{openInNewLink && (
					<OpenInNew
						classes={{ root: classes.openInNewIcon }}
						onClick={openInNewLink}
					/>
				)}
			</DialogTitle>
			<DialogContent
				classes={useCustomClasses ? { root: classes.content } : undefined}
			>
				<IsInFormDialogContext.Provider value={true}>
					<FormDialogDispatchContext.Provider value={dispatch}>
						{children}
					</FormDialogDispatchContext.Provider>
				</IsInFormDialogContext.Provider>
			</DialogContent>
		</Dialog>
	);
};

export default React.memo(FormDialog);
