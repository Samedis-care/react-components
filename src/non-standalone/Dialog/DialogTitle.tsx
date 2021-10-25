import React from "react";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import { makeStyles } from "@material-ui/core/styles";
import { Close } from "@material-ui/icons";
import { Grid, IconButton, Typography } from "@material-ui/core";

const useClasses = makeStyles((theme) => ({
	root: {
		margin: 0,
		padding: theme.spacing(2),
	},
	closeButton: {
		color: theme.palette.grey[500],
		padding: theme.spacing(1) / 2,
	},
	text: {
		textOverflow: "ellipsis",
		overflow: "hidden",
	},
	textWrapper: {
		maxWidth: "75%",
	},
}));

export interface DialogTitleProps {
	id?: string;
	children: React.ReactNode;
	onClose?: () => void;
}

const DialogTitleRaw = (props: DialogTitleProps) => {
	const { id, children, onClose } = props;

	const classes = useClasses();
	return (
		<MuiDialogTitle id={id} disableTypography className={classes.root}>
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
