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
import { combineClassNames, getFileExt } from "../../../utils";

export interface FileProps {
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
	/**
	 * Custom styles
	 */
	classes?: Partial<ReturnType<typeof useStyles>>;
}

const useStyles = makeStyles(
	(theme) => ({
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
			marginTop: 16,
		},
		iconDisabled: {
			opacity: 0.5,
		},
		clickable: {
			cursor: "pointer",
		},
		downloadLink: {
			cursor: "pointer",
			"&:hover": {
				textDecoration: "underline",
			},
		},
	}),
	{ name: "CcFile" }
);

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

const File = (props: FileProps) => {
	const { downloadLink } = props;
	const classes = useStyles(props);

	const fileExt = getFileExt(props.name);
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
							className={combineClassNames([
								classes.icon,
								props.disabled && classes.iconDisabled,
								downloadLink && classes.clickable,
							])}
							onClick={openDownload}
						/>
					) : (
						<FileIcon
							className={combineClassNames([
								classes.icon,
								downloadLink && classes.clickable,
							])}
							onClick={openDownload}
						/>
					)}
				</Grid>
				<Grid item xs={12}>
					<Tooltip title={props.name}>
						<Typography
							align={"center"}
							noWrap
							className={downloadLink ? classes.downloadLink : undefined}
							onClick={openDownload}
							variant={"body2"}
						>
							{props.name}
						</Typography>
					</Tooltip>
				</Grid>
			</Grid>
		</Grid>
	);
};

export default React.memo(File);
