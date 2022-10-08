import React from "react";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import { makeStyles } from "@material-ui/core/styles";
import { Close } from "@material-ui/icons";
import { Grid, IconButton, Typography } from "@material-ui/core";
import { combineClassNames } from "../../utils";

const useClasses = makeStyles(
	(theme) => ({
		noTitle: {
			padding: theme.spacing(1),
			position: "absolute",
			right: 0,
		},
		closeButton: {
			color: theme.palette.grey[500],
			padding: theme.spacing(1) / 2,
			zIndex: 1,
		},
		text: {
			textOverflow: "ellipsis",
			overflow: "hidden",
		},
		textWrapper: {
			maxWidth: "75%",
		},
	}),
	{ name: "CcDialogTitle" }
);

export interface DialogTitleProps {
	id?: string;
	children: React.ReactNode;
	onClose?: () => void;
	/**
	 * special CSS which puts buttons on the right floating
	 */
	noTitle?: boolean;
}

const DialogTitleRaw = (props: DialogTitleProps) => {
	const { id, children, onClose, noTitle } = props;

	const classes = useClasses();
	return (
		<MuiDialogTitle
			id={id}
			disableTypography
			className={combineClassNames([noTitle && classes.noTitle])}
		>
			<Grid container wrap={"nowrap"}>
				<Grid item className={classes.textWrapper}>
					<Typography variant="h6" noWrap className={classes.text}>
						{children}
					</Typography>
				</Grid>
				<Grid item xs />
				{onClose && (
					<Grid item>
						<IconButton
							aria-label="Close"
							className={classes.closeButton}
							onClick={onClose}
						>
							<Close />
						</IconButton>
					</Grid>
				)}
			</Grid>
		</MuiDialogTitle>
	);
};

export const DialogTitle = React.memo(DialogTitleRaw);
