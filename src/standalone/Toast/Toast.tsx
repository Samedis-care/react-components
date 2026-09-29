import React, { useCallback, useMemo } from "react";
import {
	Alert,
	AlertColor,
	AlertProps,
	AlertTitle,
	Portal,
	Snackbar,
	SnackbarCloseReason,
	SnackbarOrigin,
	SnackbarProps,
	styled,
	useThemeProps,
} from "@mui/material";
import combineClassNames from "../../utils/combineClassNames";
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
	 * Optional bold title above the message
	 */
	title?: React.ReactNode;
	/**
	 * The message
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
	 * Where the toast is shown, e.g. at the top where the bottom of the screen
	 * holds controls the toast must not cover
	 * @default { vertical: "bottom", horizontal: "right" }
	 * @remarks The theme's default props set it app-wide, this per toast
	 */
	anchorOrigin?: SnackbarOrigin;
	/**
	 * The alert variant
	 * @default "filled"
	 */
	variant?: AlertProps["variant"];
	/**
	 * Called when the toast times out or the user closes it (close button, or
	 * Escape while the toast has focus)
	 */
	onClose: () => void;
	/**
	 * Called when the close transition has finished
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

const Root = styled(Snackbar, { name: "CcToast", slot: "root" })({});

const ToastAlert = styled(Alert, { name: "CcToast", slot: "alert" })(
	({ theme }) => ({
		flexGrow: 1,
		[theme.breakpoints.up("sm")]: {
			flexGrow: "initial",
			minWidth: 288,
			maxWidth: 560,
		},
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
		variant = "filled",
		onClose,
		onExited,
		className,
		classes,
	} = props;
	const { t } = useCCTranslations();

	const duration =
		autoHideDuration !== undefined
			? autoHideDuration
			: autoHideDurations?.[severity] !== undefined
				? autoHideDurations[severity]
				: DEFAULT_AUTO_HIDE_DURATIONS[severity];

	const handleSnackbarClose = useCallback(
		(_evt: unknown, reason: SnackbarCloseReason) => {
			// a click elsewhere or Escape outside the toast belong to the page
			if (reason !== "timeout") return;
			onClose();
		},
		[onClose],
	);

	const handleKeyDown = useCallback(
		(evt: React.KeyboardEvent) => {
			if (evt.key === "Escape") onClose();
		},
		[onClose],
	);

	const slotProps: SnackbarProps["slotProps"] = useMemo(
		() => ({ transition: { onExited } }),
		[onExited],
	);

	return (
		// in a portal, so the toast is appended to the body while a dialog is
		// open and doesn't sit in the app root the dialog hides from screen readers
		<Portal>
			<Root
				open={open}
				autoHideDuration={duration}
				anchorOrigin={anchorOrigin}
				onClose={handleSnackbarClose}
				slotProps={slotProps}
				className={combineClassNames([className, classes?.root])}
			>
				<ToastAlert
					severity={severity}
					variant={variant}
					role={
						severity === "error" || severity === "warning" ? "alert" : "status"
					}
					closeText={t("standalone.toast.close")}
					onClose={onClose}
					onKeyDown={handleKeyDown}
					className={classes?.alert}
				>
					{title && <AlertTitle>{title}</AlertTitle>}
					{message}
				</ToastAlert>
			</Root>
		</Portal>
	);
};

export const Toast = React.memo(ToastRaw);
