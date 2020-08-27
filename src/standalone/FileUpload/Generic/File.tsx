import React, { useCallback } from "react";
import { Grid, Tooltip, Typography } from "@material-ui/core";
import {
	InsertDriveFileOutlined as DefaultFileIcon,
	CancelOutlined as CancelIcon,
} from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import {
	ExcelFileIcon,
	PdfFileIcon,
	PowerPointFileIcon,
	WordFileIcon,
} from "../FileIcons";

export interface IProps {
	/**
	 * The file name, including extension
	 */
	name: string;
	/**
	 * Optional callback for removing the file
	 */
	onRemove?: () => void;
	/**
	 * The size of the preview
	 */
	size: number;
	/**
	 * The preview to show instead of the file icon
	 */
	preview?: string;
	/**
	 * Display grayed-out (marked as deleted)
	 */
	disabled: boolean;
	/**
	 * The download link to open if the file is clicked
	 */
	downloadLink?: string;
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
	iconDisabled: {
		opacity: 0.5,
	},
}));

const ExcelFileExtensions = [
	"xlsx",
	"xlsm",
	"xltx",
	"xltm",
	"xls",
	"xlt",
	"xlm",
];

const WordFileExtensions = [
	"doc",
	"dot",
	"docx",
	"docm",
	"dotx",
	"dotm",
	"docb",
];

const PowerPointFileExtensions = [
	"ppt",
	"pot",
	"pps",
	"pptx",
	"pptm",
	"potx",
	"potm",
	"ppsx",
	"ppsm",
	"sldx",
	"sldm",
];

const PdfFileExtensions = ["pdf"];

const File = (props: IProps) => {
	const { downloadLink } = props;
	const classes = useStyles();

	const fileSplit = props.name.split(".");
	const fileExt = fileSplit[fileSplit.length - 1];
	const FileIcon = ExcelFileExtensions.includes(fileExt)
		? ExcelFileIcon
		: WordFileExtensions.includes(fileExt)
		? WordFileIcon
		: PowerPointFileExtensions.includes(fileExt)
		? PowerPointFileIcon
		: PdfFileExtensions.includes(fileExt)
		? PdfFileIcon
		: DefaultFileIcon;

	const openDownload = useCallback(() => {
		if (downloadLink) window.open(downloadLink, "_blank");
	}, [downloadLink]);

	return (
		<Grid item style={{ width: props.size }}>
			<Grid container spacing={2}>
				<Grid item xs={12} className={classes.iconContainer}>
					{props.onRemove && !props.disabled && (
						<CancelIcon
							className={classes.closeIcon}
							onClick={props.onRemove}
						/>
					)}
					{props.preview ? (
						<img
							src={props.preview}
							alt={props.name}
							className={
								classes.icon +
								(props.disabled ? " " + classes.iconDisabled : "")
							}
							onClick={openDownload}
						/>
					) : (
						<FileIcon className={classes.icon} onClick={openDownload} />
					)}
				</Grid>
				<Grid item xs={12}>
					<Tooltip title={props.name}>
						<Typography align={"center"} noWrap>
							{props.name}
						</Typography>
					</Tooltip>
				</Grid>
			</Grid>
		</Grid>
	);
};

export default React.memo(File);
