import React, { useCallback } from "react";
import {
	buttonBaseClasses,
	DialogTitle as MuiDialogTitle,
	dialogContentClasses,
	IconButton,
	styled,
	useThemeProps,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import combineClassNames from "../../utils/combineClassNames";
import useCCTranslations from "../../utils/useCCTranslations";
import focusRing from "../../utils/internal/focusRing";

/**
 * Props of DialogTitle; theme defaults come from
 * `theme.components.CcDialogTitle.defaultProps`
 */
export interface DialogTitleProps {
	/**
	 * Element id of the heading. It replaces the id that MUI's `Dialog` points
	 * `aria-labelledby` at, so give the `Dialog` the same value as
	 * `aria-labelledby`.
	 */
	id?: string;
	/**
	 * The title. It is the content of the heading (an `h2`) that names the
	 * dialog. A title too long for one line wraps onto more lines, like MUI's
	 * `DialogTitle`, and a word too long for a line breaks where it has to.
	 * With `noTitle` it is rendered next to the close button, not as a heading.
	 */
	children: React.ReactNode;
	/**
	 * When set, a close (X) button is shown next to the heading, named by
	 * `non-standalone.dialog.dialog-title.close`, and this is called without
	 * arguments when it is clicked. DialogTitle closes nothing itself: pass e.g.
	 * the function `useCloseThisDialog` returns. The X has the palette's
	 * `action.active` color, the color of MUI's default IconButton, whatever
	 * color a theme gives IconButtons; a theme changes it in
	 * `CcDialogTitle.styleOverrides.closeButton`.
	 */
	onClose?: () => void;
	/**
	 * Controls for the dialog as a whole, e.g. an `IconButton` with an
	 * `aria-label`, like the `action` of MUI's `CardHeader`. They are shown in
	 * the title row after the title and before the close button, outside the
	 * heading: they are not part of the dialog's name, and a long title does not
	 * push them out of the dialog. When they don't fit beside the title (several
	 * controls on a phone), they move below it, with the close button, at the
	 * end of the row; direct children that don't fit on one line wrap. Default
	 * none.
	 */
	action?: React.ReactNode;
	/**
	 * For a dialog without a visible title: no heading is rendered, so
	 * DialogTitle does not name the dialog. Name it another way, as an MUI
	 * `Dialog` without `DialogTitle`: `aria-labelledby` on the `Dialog`
	 * pointing at a heading in its content, or an `aria-label` on its paper
	 * (`slotProps.paper`). The title row is positioned absolutely at the top
	 * right (padding `theme.spacing(1)`), so only the close button shows, over
	 * the dialog content. Children are still rendered there, not as a heading
	 * (pass none, or an icon). Default false.
	 */
	noTitle?: boolean;
	/**
	 * CSS class added to the root, the title row that holds the heading and the
	 * close button
	 */
	className?: string;
	/**
	 * CSS classes per slot: `root` (the title row), `textWrapper` (the box
	 * around the heading), `text` (the heading, not rendered with `noTitle`),
	 * `controls` (the box around `action` and the close button, rendered only
	 * with one of them), `action` (the box around `action`, rendered only with
	 * it), `closeButton`
	 */
	classes?: Partial<Record<DialogTitleClassKey, string>>;
}

const Root = styled("div", { name: "CcDialogTitle", slot: "root" })(
	({ theme }) => ({
		display: "flex",
		alignItems: "center",
		// the width the title keeps beside an action
		"--cc-dialog-title-text-min-width": "0px",
		// the box of MUI's DialogTitle
		flex: "0 0 auto",
		padding: "16px 24px",
		// MUI's DialogContent drops its top padding right after a DialogTitle;
		// the heading sits inside this row, so the row carries that rule
		[`& + .${dialogContentClasses.root}:not(.${dialogContentClasses.dividers})`]:
			{
				paddingTop: 0,
			},
		// an action that doesn't fit beside the title moves below it, with the
		// close button, at the end of the row
		"&.CcDialogTitle-withAction:not(.CcDialogTitle-noTitle)": {
			flexWrap: "wrap",
			justifyContent: "flex-end",
			"--cc-dialog-title-text-min-width": "7rem",
		},
		"&.CcDialogTitle-noTitle": {
			padding: theme.spacing(1),
			position: "absolute",
			right: 0,
		},
	}),
);

const TextWrapper = styled("div", {
	name: "CcDialogTitle",
	slot: "textWrapper",
})({
	flex: "1 1 0",
	// a min-width rather than a basis: a dialog sized to its content counts it
	minWidth: "var(--cc-dialog-title-text-min-width)",
});

// MUI's DialogTitle: the h2 that MUI's Dialog is labelled by. A long title
// wraps, as MUI's does; a word wider than the dialog (a German compound on a
// phone) breaks too, also inside a flex row an app passes as the title
const Text = styled(MuiDialogTitle, { name: "CcDialogTitle", slot: "text" })({
	padding: 0,
	overflowWrap: "anywhere",
});

const CloseButton = styled(IconButton, {
	name: "CcDialogTitle",
	slot: "closeButton",
})(({ theme }) => ({
	// the color of MUI's default IconButton, 3:1 and more on the dialog's paper
	// in MUI's light and dark palettes, also where a theme gives IconButtons
	// another default color
	color: (theme.vars || theme).palette.action.active,
	padding: `calc(${theme.spacing(1)} / 2)`,
	zIndex: 1,
	// a focus ring around the circle, as on FullFormDialog's open-in-new button
	// beside it: the focus ripple alone is too faint, and forced colors drop it
	[`&.${buttonBaseClasses.focusVisible}`]: focusRing(theme, 0),
}));

// the action and the close button, which stays beside it when the action
// moves below the title or wraps
const Controls = styled("div", { name: "CcDialogTitle", slot: "controls" })({
	display: "flex",
	alignItems: "center",
	flex: "0 1 auto",
	minWidth: 0,
});

const Action = styled("div", { name: "CcDialogTitle", slot: "action" })({
	display: "flex",
	flexWrap: "wrap",
	justifyContent: "flex-end",
	alignItems: "center",
	flex: "0 1 auto",
	minWidth: 0,
});

/**
 * Slot names of `CcDialogTitle`, for `classes` and theme `styleOverrides`
 */
export type DialogTitleClassKey =
	"root" | "textWrapper" | "text" | "controls" | "action" | "closeButton";

const DialogTitleRaw = (inProps: DialogTitleProps) => {
	const props = useThemeProps({ props: inProps, name: "CcDialogTitle" });
	const { id, children, onClose, action, noTitle, className, classes } = props;

	const { t } = useCCTranslations();
	// onClose takes no arguments: it doesn't get the click event
	const handleClose = useCallback(() => onClose?.(), [onClose]);

	return (
		<Root
			className={combineClassNames([
				className,
				classes?.root,
				noTitle && "CcDialogTitle-noTitle",
				!!action && "CcDialogTitle-withAction",
			])}
		>
			<TextWrapper className={classes?.textWrapper}>
				{noTitle ? (
					children
				) : (
					<Text id={id} className={classes?.text}>
						{children}
					</Text>
				)}
			</TextWrapper>
			{(action || onClose) && (
				<Controls className={classes?.controls}>
					{action && <Action className={classes?.action}>{action}</Action>}
					{onClose && (
						<CloseButton
							aria-label={t("non-standalone.dialog.dialog-title.close")}
							className={classes?.closeButton}
							onClick={handleClose}
							size="large"
						>
							<Close />
						</CloseButton>
					)}
				</Controls>
			)}
		</Root>
	);
};

/**
 * Title row for an MUI `Dialog`: a heading with the title, optional controls
 * (`action`) and an optional close (X) button next to it. Place it inside the
 * `Dialog`: the heading is MUI's `DialogTitle`, so it names the dialog, and
 * the controls and the close button are not part of that name. With `noTitle`
 * there is no heading, only the controls and the close button, and the dialog
 * needs a name from elsewhere.
 * Theme: `CcDialogTitle` (slots `root`, `textWrapper`, `text`, `controls`,
 * `action`, `closeButton`).
 */
export const DialogTitle = React.memo(DialogTitleRaw);
