import React, {
	Dispatch,
	SetStateAction,
	Suspense,
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	buttonBaseClasses,
	Dialog,
	DialogContent,
	IconButton,
	styled,
	useThemeProps,
} from "@mui/material";
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
import focusRing from "../../utils/internal/focusRing";

export type FormDialogRendererProps = Omit<FormDialogProps, "renderer">;

export interface FormDialogProps {
	/**
	 * Dialog tille
	 */
	dialogTitle?: React.ReactNode;
	/**
	 * Accessible name of the dialog while it shows no title (no `dialogTitle` and none set
	 * through `FormDialogDispatch.setTitle`), e.g. the translated purpose of a picker. A shown
	 * title names the dialog instead. Without either the dialog has no name, like an MUI `Dialog`
	 * without `DialogTitle`: screen readers announce only "dialog". Content that sets its title
	 * only once it has loaded needs none: the title takes the focus when it shows, so screen
	 * readers read it (see `FullFormDialog`).
	 */
	"aria-label"?: string;
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
	 * Shows an "Open in new tab" button (the open-in-new icon, named by
	 * `backend-components.form.form-dialog.open-in-new-tab`) in the title row,
	 * before the close button, and calls this, without arguments, when it is
	 * activated. Open the dialog's content in a new tab there, e.g. with
	 * `window.open(url, "_blank")`. A link set through
	 * `FormDialogDispatch.setOpenInNewLink` wins over this prop. Default none: no
	 * button.
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

// the size of DialogTitle's close button, which it stands next to
const OpenInNewButton = styled(IconButton, {
	name: "CcFormDialog",
	slot: "openInNewButton",
})(({ theme }) => ({
	padding: `calc(${theme.spacing(1)} / 2)`,
	[`&.${buttonBaseClasses.focusVisible}`]: focusRing(theme, 0),
}));

const OpenInNewIcon = styled(OpenInNew, {
	name: "CcFormDialog",
	slot: "openInNewIcon",
})({});

/**
 * Slot names of `CcFormDialog`, for theme `styleOverrides`: `content` (the
 * content area with useCustomClasses), `openInNewButton` (the "Open in new tab"
 * button) and `openInNewIcon` (its icon)
 */
export type FormDialogClassKey =
	"content" | "openInNewButton" | "openInNewIcon";

export type FormDialogTitlePriorityMode = "prop" | "dispatch";

export interface FormDialogDispatch {
	/**
	 * Shows this title in the dialog's title bar (see `useSetFormDialogTitle`), null for none.
	 * A title that shows only after the dialog opened takes the keyboard focus if it is still on
	 * the dialog itself (see `FullFormDialog`).
	 */
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

/**
 * The keyboard focus of a dialog whose title can show after it opened. MUI's Dialog focuses
 * its paper (the element with role="dialog") when it opens, and screen readers then announce
 * the dialog with its name, which is its title. A title that shows only later (content that
 * sets it once it has loaded) is not announced. So when the title shows after the dialog has
 * been on screen for a frame with the focus on its paper and no title, the focus moves on to
 * the title heading, and screen readers read the title. Focus the user moved elsewhere stays
 * there, and a title shown when the dialog opens (from the dialogTitle prop, or set by the
 * content as it mounts) leaves the focus on the paper. When the title goes away while it holds
 * the focus (the content that set it unmounts), the paper gets the focus back, rather than the
 * page.
 * @param titleShown Whether the dialog shows a title heading, which its paper's
 * aria-labelledby points at
 * @returns The ref and the focus handler for the dialog's paper
 */
const useLateTitleFocus = (titleShown: boolean) => {
	const paperRef = useRef<HTMLDivElement>(null);
	// titleShown as of the last commit
	const titleShownRef = useRef(titleShown);
	// the dialog has been on screen for a frame with the focus on its paper and no title: a
	// screen reader has announced it without its title
	const untitledRef = useRef(false);
	// the frame requested when the paper took the focus without a title
	const frameRef = useRef<{ win: Window; id: number } | null>(null);

	const onPaperFocus = useCallback((evt: React.FocusEvent<HTMLElement>) => {
		if (evt.target !== evt.currentTarget) return;
		if (titleShownRef.current || frameRef.current) return;
		const win = evt.currentTarget.ownerDocument.defaultView;
		if (!win) return;
		const id = win.requestAnimationFrame(() => {
			frameRef.current = null;
			if (!titleShownRef.current) untitledRef.current = true;
		});
		frameRef.current = { win, id };
	}, []);

	useEffect(
		() => () => {
			const frame = frameRef.current;
			frameRef.current = null;
			frame?.win.cancelAnimationFrame(frame.id);
		},
		[],
	);

	// a layout effect: it runs before the browser paints, and after React has put back the
	// focus it saved around the commit, which it does not for a removed heading
	useLayoutEffect(() => {
		const wasShown = titleShownRef.current;
		titleShownRef.current = titleShown;
		const paper = paperRef.current;
		if (!paper) return;
		const doc = paper.ownerDocument;
		const focused = doc.activeElement;
		if (!titleShown) {
			// the title went away, and the focus with it
			if (wasShown && (!focused || focused === doc.body)) paper.focus();
			return;
		}
		const late = untitledRef.current;
		untitledRef.current = false;
		if (!late || focused !== paper) return;
		const heading = doc.getElementById(
			paper.getAttribute("aria-labelledby") ?? "",
		);
		if (!heading || !paper.contains(heading)) return;
		// focusable by script, not a stop of Tab
		if (!heading.hasAttribute("tabindex"))
			heading.setAttribute("tabindex", "-1");
		heading.focus();
	}, [titleShown]);

	return { paperRef, onPaperFocus };
};

/**
 * The dialog FullFormDialog renders by default (its `renderer`): an MUI `Dialog` with a
 * `DialogTitle` (the title, the open-in-new button and the close button) and the content. The
 * title names the dialog, else `aria-label` does. A title that shows only after the dialog
 * opened takes the keyboard focus if it is still on the dialog itself, so screen readers read
 * it (see `FullFormDialog`). A custom renderer can render it with changed props.
 * @param props The props of FullFormDialog, with the title to show as `dialogTitle`
 */
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
		"aria-label": ariaLabel,
	} = props;
	const { t } = useCCTranslations();
	const ContentComp = useCustomClasses ? TallDialogContent : DialogContent;
	const { paperRef, onPaperFocus } = useLateTitleFocus(!!dialogTitle);
	// the paper is the element with role="dialog"; a shown title names it through MUI's
	// aria-labelledby, which wins over aria-label
	const slotProps = useMemo(
		() => ({
			paper: { "aria-label": ariaLabel, ref: paperRef, onFocus: onPaperFocus },
		}),
		[ariaLabel, paperRef, onPaperFocus],
	);
	// a button outside the heading: reachable by Tab, named, and not part of the
	// dialog's name
	const openInNewAction = useMemo(() => {
		if (!openInNewLink) return null;
		const openInNew = () => openInNewLink();
		return (
			<OpenInNewButton
				aria-label={t("backend-components.form.form-dialog.open-in-new-tab")}
				onClick={openInNew}
			>
				<OpenInNewIcon />
			</OpenInNewButton>
		);
	}, [openInNewLink, t]);
	return (
		<Dialog
			maxWidth={maxWidth ?? "lg"}
			open={true}
			onClose={onClose}
			fullWidth={fullWidth ?? true}
			className={combineClassNames(["CcFormDialog", className])}
			slotProps={slotProps}
		>
			<DialogTitle
				onClose={onClose}
				noTitle={!dialogTitle}
				action={openInNewAction}
			>
				{dialogTitle}
			</DialogTitle>
			<ContentComp>
				<Suspense fallback={<Loader />}>{children}</Suspense>
			</ContentComp>
		</Dialog>
	);
};

/**
 * A dialog for a form page or other content, opened with `pushDialog`: a title bar with the
 * title, an optional "Open in new tab" button and the close button, and the content below.
 * The content can set the title (`useSetFormDialogTitle`, `PageTitle`), guard closing while it
 * has unsaved changes, and close the dialog (`useCloseThisDialog`).
 *
 * The title names the dialog for screen readers, else `aria-label` does. MUI's Dialog puts the
 * keyboard focus on the dialog when it opens, and screen readers announce it with its name. A
 * title that the content sets only once it has loaded comes after that announcement: when it
 * shows while the focus is still on the dialog itself, the focus moves on to the title, so
 * screen readers read it. Focus the user moved elsewhere stays there.
 * Theme: `CcFormDialog` (default props, the slots of `FormDialogClassKey`).
 * @param inProps The props
 */
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
