import React from "react";
import {
	DialogTitle as MuiDialogTitle,
	Grid,
	IconButton,
	styled,
	Typography,
	useThemeProps,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import combineClassNames from "../../utils/combineClassNames";
import useCCTranslations from "../../utils/useCCTranslations";

export interface DialogTitleProps {
	id?: string;
	children: React.ReactNode;
	onClose?: () => void;
	/**
	 * special CSS which puts buttons on the right floating
	 */
	noTitle?: boolean;
	/**
	 * css class to apply to root
	 */
	className?: string;
	/**
	 * custom CSS styles
	 */
	classes?: Partial<Record<DialogTitleClassKey, string>>;
}

const Root = styled(MuiDialogTitle, { name: "CcDialogTitle", slot: "root" })(
	({ theme }) => ({
		"&.CcDialogTitle-noTitle": {
			padding: theme.spacing(1),
			position: "absolute",
			right: 0,
		},
	}),
);

const TextWrapper = styled(Grid, {
	name: "CcDialogTitle",
	slot: "textWrapper",
})({});

const Text = styled(Typography, { name: "CcDialogTitle", slot: "text" })({
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

export type DialogTitleClassKey =
	| "root"
	| "textWrapper"
	| "text"
	| "closeButton";

const DialogTitleRaw = (inProps: DialogTitleProps) => {
	const props = useThemeProps({ props: inProps, name: "CcDialogTitle" });
	const { id, children, onClose, noTitle, className, classes } = props;

	const { t } = useCCTranslations();

	return (
		<Root
			id={id}
			className={combineClassNames([
				className,
				classes?.root,
				noTitle && "CcDialogTitle-noTitle",
			])}
		>
			<Grid
				container
				wrap={"nowrap"}
				justifyContent={"space-between"}
				alignItems={"center"}
			>
				<TextWrapper size={"grow"} className={classes?.textWrapper}>
					<Text variant="h6" noWrap className={classes?.text}>
						{children}
					</Text>
				</TextWrapper>
				{onClose && (
					<Grid>
						<CloseButton
							aria-label={t("non-standalone.dialog.dialog-title.close")}
							className={classes?.closeButton}
							onClick={onClose}
							size="large"
						>
							<Close />
						</CloseButton>
					</Grid>
				)}
			</Grid>
		</Root>
	);
};

export const DialogTitle = React.memo(DialogTitleRaw);
