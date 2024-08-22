import React, { Suspense, useCallback, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, styled, useThemeProps } from "@mui/material";
import { OpenInNew } from "@mui/icons-material";
import { useDialogContext } from "../../framework/DialogContextProvider";
import { showConfirmDialog } from "../../non-standalone/Dialog/Utils";
import { DialogTitle } from "../../non-standalone/Dialog/DialogTitle";
import useCCTranslations from "../../utils/useCCTranslations";
import Loader from "../../standalone/Loader";
import combineClassNames from "../../utils/combineClassNames";

export type FormDialogRendererProps = Omit<FormDialogProps, "renderer">;

export interface FormDialogProps {
	/**
	 * Dialog tille
	 */
	dialogTitle?: React.ReactNode;
	/**
	 * Dialog width optional parameter
	 * @default "lg"
	 */
	maxWidth?: false | "lg" | "xs" | "sm" | "md" | "xl" | undefined;
	/**
	 * Dialog fullWidth param
	 * @default true
	 */
	fullWidth?: boolean;
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
	/**
	 * CSS class name
	 */
	className?: string;
	/**
	 * Custom renderer, does not need to provide IsInFormDialogContext, FormDialogDispatchContext or handle their logic
	 */
	renderer?: React.ComponentType<FormDialogRendererProps>;
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
	setTitle: (title: React.ReactNode) => void;
	blockClosing: () => void;
	unblockClosing: () => void;
}

export const IsInFormDialogContext = React.createContext(false);
export const FormDialogDispatchContext = React.createContext<
	FormDialogDispatch | undefined
>(undefined);

export const FormDialogDefaultRenderer = (props: FormDialogRendererProps) => {
	const {
		maxWidth,
		onClose,
		fullWidth,
		className,
		dialogTitle,
		openInNewLink,
		useCustomClasses,
		children,
	} = props;
	const ContentComp = useCustomClasses ? TallDialogContent : DialogContent;
	return (
		<Dialog
			maxWidth={maxWidth ?? "lg"}
			open={true}
			onClose={onClose}
			fullWidth={fullWidth ?? true}
			className={combineClassNames(["CcFormDialog", className])}
		>
			<DialogTitle onClose={onClose} noTitle={!dialogTitle}>
				{dialogTitle}
				{openInNewLink && <OpenInNewIcon onClick={openInNewLink} />}
			</DialogTitle>
			<ContentComp>
				<Suspense fallback={<Loader />}>{children}</Suspense>
			</ContentComp>
		</Dialog>
	);
};

const FormDialog = (inProps: FormDialogProps) => {
	const props = useThemeProps({ props: inProps, name: "CcFormDialog" });
	const {
		dialogTitle: titleOverride,
		onClose,
		disableFormDialogContext,
		renderer,
	} = props;
	const [pushDialog, popDialog] = useDialogContext();
	const blockClosingCounter = useRef(0);
	const [title, setTitle] = useState<React.ReactNode>(null);
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
		} catch {
			// user cancelled
		}
	}, [t, onClose, popDialog, pushDialog]);

	const blockClosing = useCallback(() => blockClosingCounter.current++, []);
	const unblockClosing = useCallback(() => blockClosingCounter.current--, []);
	const dispatch = useMemo(
		(): FormDialogDispatch => ({
			blockClosing,
			unblockClosing,
			setTitle,
		}),
		[blockClosing, unblockClosing],
	);

	const dialogTitle = titleOverride ?? title;
	const Renderer = renderer ?? FormDialogDefaultRenderer;

	return (
		<IsInFormDialogContext.Provider value={!disableFormDialogContext}>
			<FormDialogDispatchContext.Provider value={dispatch}>
				<Renderer {...props} onClose={handleClose} dialogTitle={dialogTitle} />
			</FormDialogDispatchContext.Provider>
		</IsInFormDialogContext.Provider>
	);
};

export default React.memo(FormDialog);
