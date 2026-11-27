import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
	Alert,
	alertClasses,
	AlertColor,
	AlertProps,
	AlertTitle,
	buttonBaseClasses,
	CSSObject,
	Portal,
	Snackbar,
	SnackbarCloseReason,
	SnackbarOrigin,
	SnackbarProps,
	styled,
	Theme,
	useMediaQuery,
	useTheme,
	useThemeProps,
} from "@mui/material";
import combineClassNames from "../../utils/combineClassNames";
import focusRing from "../../utils/internal/focusRing";
import readableFill from "../../utils/internal/readableFill";
import useLiveRegionText from "../../utils/internal/useLiveRegionText";
import useCCTranslations from "../../utils/useCCTranslations";

export interface ToastProps {
	/**
	 * Is the toast shown?
	 */
	open: boolean;
	/**
	 * The severity, sets the color, the icon and how urgently screen readers
	 * announce the toast (error and warning interrupt, success and info wait)
	 * @default "info"
	 */
	severity?: AlertColor;
	/**
	 * Optional bold title above the message. Like the message, it is rendered a
	 * frame after the toast opens (see Toast)
	 */
	title?: React.ReactNode;
	/**
	 * The message. Its text and the title wrap within the toast; a word too
	 * long for a line (a URL, an id) breaks where it has to, so the toast stays
	 * within the screen. Shown through the ToastContext, the title and message
	 * render where the ToastContextProvider renders its toasts, not where
	 * showToast was called (see useToastContext). It is rendered a frame after
	 * the toast opens, and rendered anew (its components mount again) each time
	 * the toast opens and when a new severity switches its role (see Toast)
	 */
	message: React.ReactNode;
	/**
	 * Milliseconds until the toast closes by itself, null keeps it open until
	 * the user closes it. Defaults to autoHideDurations[severity]
	 */
	autoHideDuration?: number | null;
	/**
	 * The default autoHideDuration per severity, for use in the theme.
	 * Severities left out use 4 s (success, info) and 6 s (warning, error)
	 */
	autoHideDurations?: Partial<Record<AlertColor, number | null>>;
	/**
	 * Where the toast is shown from the sm breakpoint up, e.g. at the top where
	 * the bottom of the screen holds controls the toast must not cover. Below
	 * sm the toast spans the screen's width and phoneVertical sets whether it
	 * is at the top or the bottom
	 * @default { vertical: "bottom", horizontal: "right" }
	 * @remarks The theme's default props set it app-wide, this per toast
	 */
	anchorOrigin?: SnackbarOrigin;
	/**
	 * Where the toast is shown below the sm breakpoint (phones, and wider
	 * windows zoomed in), where it spans the screen's width: at the top or at
	 * the bottom edge. At the top it keeps clear of the action bars and dialog
	 * buttons at the bottom of the screen, which the full-width toast would
	 * otherwise cover; it covers the top of the page (e.g. an app bar) instead
	 * @default "top"
	 * @remarks The theme's default props set it app-wide, this per toast
	 */
	phoneVertical?: SnackbarOrigin["vertical"];
	/**
	 * The alert variant
	 * @default "filled"
	 * @remarks `filled` is MUI's filled Alert: MUI's text color
	 * (`palette.getContrastText(palette[severity].main)`) on MUI's fill
	 * (`palette[severity].main`, in a dark palette `.dark`). Where that text has
	 * less than the 4.5:1 that text needs, the toast darkens the fill (behind
	 * dark text: lightens it) just enough, keeping its hue; with MUI's default
	 * light palette that is info and warning. A custom palette needs nothing
	 * more: only a color the toast cannot measure (a CSS variable, a keyword) is
	 * used as it is, and must then reach 4.5:1 with its contrast text itself.
	 * `standard` and `outlined` keep MUI's colors.
	 */
	variant?: AlertProps["variant"];
	/**
	 * Called when the toast times out or the user closes it: with its close
	 * button, or with Escape, wherever focus is, unless something else used
	 * that Escape (an open dialog, menu or autocomplete closes instead, as
	 * does anything that prevents the key's default). A click elsewhere does
	 * not call it
	 */
	onClose: () => void;
	/**
	 * Called when the close transition has finished: the moment to unmount the
	 * toast or clear its content. A toast rendered closed without having been
	 * in the page (e.g. closed in the update that opened it) has no close
	 * transition and calls it right after that render, once. Optional: the
	 * closed toast leaves the page after its close transition with or without it
	 */
	onExited?: () => void;
	/**
	 * CSS class to apply to the root
	 */
	className?: string;
	/**
	 * Custom CSS classes
	 */
	classes?: Partial<Record<ToastClassKey, string>>;
}

export type ToastClassKey = "root" | "alert";

const DEFAULT_AUTO_HIDE_DURATIONS: Record<AlertColor, number> = {
	success: 4000,
	info: 4000,
	warning: 6000,
	error: 6000,
};

const DEFAULT_ANCHOR_ORIGIN: SnackbarOrigin = {
	vertical: "bottom",
	horizontal: "right",
};

const COLOR_CLASSES: Record<AlertColor, string> = {
	success: alertClasses.colorSuccess,
	info: alertClasses.colorInfo,
	warning: alertClasses.colorWarning,
	error: alertClasses.colorError,
};

/**
 * The fills of the filled variant that differ from MUI's: for each severity
 * whose text has less than 4.5:1 on MUI's fill, that fill moved away from the
 * text just enough (MUI's own aims at 3:1). The text color stays MUI's.
 * @param theme The theme
 * @returns The rules for the alert slot
 */
const readableFilledFills = (theme: Theme): CSSObject => {
	const rules: CSSObject = {};
	for (const [severity, colorClass] of Object.entries(COLOR_CLASSES)) {
		const color = theme.palette[severity as AlertColor];
		const fill = theme.palette.mode === "dark" ? color.dark : color.main;
		const readable = readableFill(
			fill,
			theme.palette.getContrastText(color.main),
		);
		if (readable !== fill) {
			rules[`&.${alertClasses.filled}.${colorClass}`] = {
				backgroundColor: readable,
			};
		}
	}
	// with CSS theme variables, only in the color scheme theme.palette
	// describes; other schemes keep MUI's fills
	return theme.applyStyles(theme.palette.mode, rules);
};

const Root = styled(Snackbar, { name: "CcToast", slot: "root" })({});

const ToastAlert = styled(Alert, { name: "CcToast", slot: "alert" })(
	({ theme }) => ({
		flexGrow: 1,
		// below sm the toast spans the screen: content that cannot wrap (an
		// image, preformatted text) scrolls inside the message, as on wider
		// screens, instead of pushing the toast past the screen's edge
		minWidth: 0,
		[theme.breakpoints.up("sm")]: {
			flexGrow: "initial",
			minWidth: 288,
			maxWidth: 560,
		},
		// a word too long for a line (a German compound, a URL, an id in a
		// server error) breaks where it has to instead of making the message
		// scroll sideways. "break-word" would not lower the toast's minimum
		// width, which on a phone pushed it past the screen's left edge
		[`& .${alertClasses.message}`]: {
			overflowWrap: "anywhere",
		},
		// the keyboard-focused close button: MUI shows only its focus ripple,
		// faint and gone in forced colors. The ring takes the toast's text
		// color, which contrasts with every fill, where the primary color may not
		[`& .${alertClasses.action} .${buttonBaseClasses.focusVisible}`]: focusRing(
			theme,
			2,
			"currentColor",
		),
		...readableFilledFills(theme),
	}),
);

const ToastRaw = (inProps: ToastProps) => {
	const props = useThemeProps({ props: inProps, name: "CcToast" });
	const {
		open,
		severity = "info",
		title,
		message,
		autoHideDuration,
		autoHideDurations,
		anchorOrigin = DEFAULT_ANCHOR_ORIGIN,
		phoneVertical = "top",
		variant = "filled",
		onClose,
		onExited,
		className,
		classes,
	} = props;
	const { t } = useCCTranslations();
	const theme = useTheme();

	const role =
		severity === "error" || severity === "warning" ? "alert" : "status";
	// the alert element is the live region: the title and message go into it a
	// frame after it is in the page (and after each opening and role change),
	// so screen readers announce them
	const [regionRef, textShown] = useLiveRegionText(open, role);

	// below sm MUI's Snackbar spans the screen's width: there only the
	// vertical position counts, and it is phoneVertical's
	const phone = useMediaQuery(theme.breakpoints.down("sm"));
	const placement = useMemo(
		() =>
			phone && anchorOrigin.vertical !== phoneVertical
				? { vertical: phoneVertical, horizontal: anchorOrigin.horizontal }
				: anchorOrigin,
		[phone, anchorOrigin, phoneVertical],
	);

	const duration =
		autoHideDuration !== undefined
			? autoHideDuration
			: autoHideDurations?.[severity] !== undefined
				? autoHideDurations[severity]
				: DEFAULT_AUTO_HIDE_DURATIONS[severity];

	const handleSnackbarClose = useCallback(
		(_evt: unknown, reason: SnackbarCloseReason) => {
			// a click elsewhere belongs to the page. Escape anywhere closes the
			// toast, as MUI's Snackbar does: its document listener skips an
			// Escape whose default was prevented, and a dialog or menu stops
			// the Escape that closes it before it gets there
			if (reason === "clickaway") return;
			onClose();
		},
		[onClose],
	);

	const handleKeyDown = useCallback(
		(evt: React.KeyboardEvent) => {
			if (evt.key !== "Escape") return;
			// handled: the Snackbar's document listener skips it, so onClose is
			// called once
			evt.preventDefault();
			onClose();
		},
		[onClose],
	);

	const onExitedRef = useRef(onExited);
	onExitedRef.current = onExited;
	// the toast has been in the page (its close transition calls onExited), or
	// has called onExited without one
	const exitHandledRef = useRef(false);

	const handleEnter = useCallback(() => {
		exitHandledRef.current = true;
	}, []);
	const handleExited = useCallback(() => {
		onExitedRef.current?.();
	}, []);

	// rendered closed without having been in the page (e.g. closed in the
	// update that opened it), the Snackbar renders nothing and runs no close
	// transition: the toast has exited already. Once, also when StrictMode runs
	// the effect twice
	useEffect(() => {
		if (open || exitHandledRef.current) return;
		exitHandledRef.current = true;
		onExitedRef.current?.();
	}, [open]);

	// both handlers are functions: an onExited key, even undefined, replaces
	// the Snackbar's own exit handler, so the closed toast would stay in the page
	const slotProps: SnackbarProps["slotProps"] = useMemo(
		() => ({ transition: { onEnter: handleEnter, onExited: handleExited } }),
		[handleEnter, handleExited],
	);

	return (
		// in a portal, so the toast is appended to the body while a dialog is
		// open and doesn't sit in the app root the dialog hides from screen readers
		<Portal>
			<Root
				open={open}
				autoHideDuration={duration}
				anchorOrigin={placement}
				onClose={handleSnackbarClose}
				slotProps={slotProps}
				className={combineClassNames([className, classes?.root])}
			>
				<ToastAlert
					ref={regionRef}
					severity={severity}
					variant={variant}
					role={role}
					closeText={t("standalone.toast.close")}
					onClose={onClose}
					onKeyDown={handleKeyDown}
					className={classes?.alert}
				>
					{textShown && title && <AlertTitle>{title}</AlertTitle>}
					{textShown && message}
				</ToastAlert>
			</Root>
		</Portal>
	);
};

/**
 * A short, non-blocking notice: a MUI Alert in a Snackbar, rendered in a portal
 * at the end of the page. Apps usually show it through useToastContext.
 *
 * Screen readers announce it: errors and warnings at once (role="alert"),
 * success and info when the user is idle (role="status"). They announce the
 * text written into such a live region after it is in the page, and often
 * skip a region that appears with its text already in it. So the toast's title
 * and message are written into it a frame after the toast is in the page (it is
 * still fading in), and written anew each time the toast opens and when a new
 * severity switches it between the two roles. A test that finds the toast by
 * its role waits for its text, e.g.
 * `await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Saved."))`.
 */
export const Toast = React.memo(ToastRaw);
