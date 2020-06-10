import React from "react";
import { Grid, Typography } from "@material-ui/core";
import {
	InsertDriveFileOutlined as FileIcon,
	CancelOutlined as CancelIcon,
} from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";

export interface IProps {
	/**
	 * The file name, including extension
	 */
	name: string;
	/**
	 * The mime type of the file
	 */
	mimeType: string;
	/**
	 * Optional callback for removing the file
	 */
	onRemove?: () => void;
	/**
	 * The size of the preview
	 */
	size: number;
}

const useStyles = makeStyles((theme) => ({
	iconContainer: {
		position: "relative",
	},
	closeIcon: {
		position: "absolute",
		cursor: "pointer",
		color: theme.palette.error.main,
	},
	icon: {
		width: "100%",
		height: "auto",
	},
}));

export default (props: IProps) => {
	const classes = useStyles();

	return (
		<Grid item style={{ width: props.size }}>
			<Grid container spacing={2} zeroMinWidth>
				<Grid item xs={12} className={classes.iconContainer}>
					<CancelIcon className={classes.closeIcon} onClick={props.onRemove} />
					<FileIcon className={classes.icon} />
				</Grid>
				<Grid item xs={12}>
					<Typography align={"center"} noWrap>
						{props.name}
					</Typography>
				</Grid>
			</Grid>
		</Grid>
	);
};
