import React, {
	Dispatch,
	SetStateAction,
	Suspense,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
} from "react";
import { Dialog, DialogContent, styled, useThemeProps } from "@mui/material";
import { OpenInNew } from "@mui/icons-material";
import { useDialogContext } from "../../framework/DialogContextProvider";
import {
	PushedDialogClose,
	PushedDialogCloseContext,
} from "../../framework/PushedDialogCloseContext";
import { captureError } from "../../framework/ErrorReporting";
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
	 * Called when the X, Escape or a backdrop click closes the dialog, after "Leave form
	 * page?" when a form page inside is dirty. A dialog shown with pushDialog then closes
	 * itself, unless onClose closed it already, so `onClose={popDialog}` closes only this
	 * dialog. A dialog rendered without pushDialog closes only through onClose, which has to
	 * stop rendering it. Not called when the content closes the dialog (useCloseThisDialog,
	 * popDialog, a goBack).
	 * @remarks Runs while the dialog is still open: a navigation from onClose is blocked like
	 *          any navigation while a pushed dialog is open.
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

export type FormDialogTitlePriorityMode = "prop" | "dispatch";

export interface FormDialogDispatch {
	setTitle: (title: React.ReactNode) => void;
	setOpenInNewLink: Dispatch<SetStateAction<null | (() => void)>>;
	blockClosing: () => void;
	unblockClosing: () => void;
	/**
	 * Set the priority mode for the dialog title.
	 * - "prop" (default): dialogTitle prop takes priority over title set via setTitle
	 * - "dispatch": title set via setTitle takes priority over dialogTitle prop
	 */
	setTitlePriorityMode: Dispatch<SetStateAction<FormDialogTitlePriorityMode>>;
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
		openInNewLink: openInNewLinkOverride,
		renderer,
	} = props;
	const [pushDialog] = useDialogContext();
	// not useCloseThisDialog, which throws: a FullFormDialog may be rendered without pushDialog,
	// then it closes through onClose. It is the pushed dialog when the nearest close comes from
	// pushDialog; inside another FullFormDialog's content it was rendered without pushDialog.
	const outerClose = useContext(PushedDialogCloseContext);
	const closeThisDialog = outerClose?.pushed ? outerClose.close : null;
	const blockClosingCounter = useRef(0);
	const [title, setTitle] = useState<React.ReactNode>(null);
	const [openInNewLink, setOpenInNewLink] = useState<null | (() => void)>(null);
	const [titlePriorityMode, setTitlePriorityMode] =
		useState<FormDialogTitlePriorityMode>("prop");
	const { t } = useCCTranslations();

	const handleClose = useCallback(async () => {
		if (blockClosingCounter.current > 0) {
			try {
				await showConfirmDialog(pushDialog, {
					title: t("backend-components.form.back-on-dirty.title"),
					message: t("backend-components.form.back-on-dirty.message"),
					textButtonYes: t("backend-components.form.back-on-dirty.yes"),
					textButtonNo: t("backend-components.form.back-on-dirty.no"),
				});
			} catch {
				return; // user cancelled
			}
		}
		if (!closeThisDialog && !onClose) {
			// eslint-disable-next-line no-console
			console.error(
				new Error(
					"[Components-Care] FullFormDialog: rendered without pushDialog and without onClose, so it cannot be closed. Show it with pushDialog, or pass an onClose that stops rendering it.",
				),
			);
			return;
		}
		// onClose first: it may close the dialog itself (onClose={popDialog}, or the state of a
		// dialog rendered without pushDialog), and closing this dialog again does nothing
		try {
			onClose?.();
		} catch (e) {
			captureError(e, { source: "FullFormDialog.onClose" });
			// eslint-disable-next-line no-console
			console.error("[Components-Care] [FullFormDialog] onClose threw", e);
		}
		closeThisDialog?.();
	}, [t, onClose, closeThisDialog, pushDialog]);

	const blockClosing = useCallback(() => blockClosingCounter.current++, []);
	const unblockClosing = useCallback(() => blockClosingCounter.current--, []);
	const dispatch = useMemo(
		(): FormDialogDispatch => ({
			blockClosing,
			unblockClosing,
			setTitle,
			setOpenInNewLink,
			setTitlePriorityMode,
		}),
		[blockClosing, unblockClosing],
	);

	const dialogTitle =
		titlePriorityMode === "dispatch"
			? (title ?? titleOverride)
			: (titleOverride ?? title);
	const Renderer = renderer ?? FormDialogDefaultRenderer;
	// the content's useCloseThisDialog closes this dialog; a FullFormDialog rendered in the
	// content without pushDialog sees pushed: false and closes through its own onClose
	const contentClose = useMemo(
		(): PushedDialogClose | null =>
			closeThisDialog ? { close: closeThisDialog, pushed: false } : null,
		[closeThisDialog],
	);

	return (
		<IsInFormDialogContext.Provider value={!disableFormDialogContext}>
			<FormDialogDispatchContext.Provider value={dispatch}>
				<PushedDialogCloseContext.Provider value={contentClose}>
					<Renderer
						{...props}
						onClose={handleClose}
						dialogTitle={dialogTitle}
						openInNewLink={openInNewLink ?? openInNewLinkOverride}
					/>
				</PushedDialogCloseContext.Provider>
			</FormDialogDispatchContext.Provider>
		</IsInFormDialogContext.Provider>
	);
};

export default React.memo(FormDialog);
