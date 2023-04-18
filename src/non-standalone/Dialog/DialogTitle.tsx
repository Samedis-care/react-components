import React from "react";
import { DialogTitle as MuiDialogTitle } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Close } from "@mui/icons-material";
import { Grid, IconButton, Typography } from "@mui/material";
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
			padding: `calc(${theme.spacing(1)} / 2)`,
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
							size="large"
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
