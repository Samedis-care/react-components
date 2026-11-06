import React from "react";
import {
	DialogTitle as MuiDialogTitle,
	dialogContentClasses,
	IconButton,
	styled,
	useThemeProps,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import combineClassNames from "../../utils/combineClassNames";
import useCCTranslations from "../../utils/useCCTranslations";

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
	 * dialog, rendered on one line and cut with an ellipsis when too long.
	 */
	children: React.ReactNode;
	/**
	 * When set, a close (X) button is shown next to the heading, named by
	 * `non-standalone.dialog.dialog-title.close`, and this is called when it is
	 * clicked. DialogTitle closes nothing itself: pass e.g. `popDialog`.
	 */
	onClose?: () => void;
	/**
	 * For a dialog without a visible title: the title row is positioned
	 * absolutely at the top right (padding `theme.spacing(1)`), so only the
	 * close button shows, over the dialog content. Children are still rendered
	 * (pass none). Default false.
	 */
	noTitle?: boolean;
	/**
	 * CSS class added to the root, the title row that holds the heading and the
	 * close button
	 */
	className?: string;
	/**
	 * CSS classes per slot: `root` (the title row), `textWrapper` (the box
	 * around the heading), `text` (the heading), `closeButton`
	 */
	classes?: Partial<Record<DialogTitleClassKey, string>>;
}

const Root = styled("div", { name: "CcDialogTitle", slot: "root" })(
	({ theme }) => ({
		display: "flex",
		alignItems: "center",
		// the box of MUI's DialogTitle
		flex: "0 0 auto",
		padding: "16px 24px",
		// MUI's DialogContent drops its top padding right after a DialogTitle;
		// the heading sits inside this row, so the row carries that rule
		[`& + .${dialogContentClasses.root}:not(.${dialogContentClasses.dividers})`]:
			{
				paddingTop: 0,
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
	minWidth: 0,
});

// MUI's DialogTitle: the h2 that MUI's Dialog is labelled by
const Text = styled(MuiDialogTitle, { name: "CcDialogTitle", slot: "text" })({
	padding: 0,
	textOverflow: "ellipsis",
	overflow: "hidden",
});

const CloseButton = styled(IconButton, {
	name: "CcDialogTitle",
	slot: "closeButton",
})(({ theme }) => ({
	color: theme.palette.grey[500],
	padding: `calc(${theme.spacing(1)} / 2)`,
	zIndex: 1,
}));

/**
 * Slot names of `CcDialogTitle`, for `classes` and theme `styleOverrides`
 */
export type DialogTitleClassKey =
	"root" | "textWrapper" | "text" | "closeButton";

const DialogTitleRaw = (inProps: DialogTitleProps) => {
	const props = useThemeProps({ props: inProps, name: "CcDialogTitle" });
	const { id, children, onClose, noTitle, className, classes } = props;

	const { t } = useCCTranslations();

	return (
		<Root
			className={combineClassNames([
				className,
				classes?.root,
				noTitle && "CcDialogTitle-noTitle",
			])}
		>
			<TextWrapper className={classes?.textWrapper}>
				<Text id={id} noWrap className={classes?.text}>
					{children}
				</Text>
			</TextWrapper>
			{onClose && (
				<CloseButton
					aria-label={t("non-standalone.dialog.dialog-title.close")}
					className={classes?.closeButton}
					onClick={onClose}
					size="large"
				>
					<Close />
				</CloseButton>
			)}
		</Root>
	);
};

/**
 * Title row for an MUI `Dialog`: a heading with the title and an optional
 * close (X) button next to it. Place it inside the `Dialog`: the heading is
 * MUI's `DialogTitle`, so it names the dialog, and the close button is not
 * part of that name.
 * Theme: `CcDialogTitle` (slots `root`, `textWrapper`, `text`, `closeButton`).
 */
export const DialogTitle = React.memo(DialogTitleRaw);
