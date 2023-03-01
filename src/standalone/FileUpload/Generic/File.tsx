import React, { useCallback } from "react";
import { Grid, SvgIconProps, Tooltip, Typography } from "@material-ui/core";
import {
	InsertDriveFile as DefaultFileIcon,
	CancelOutlined as CancelIcon,
	Cancel as CancelIconList,
} from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import {
	ArchiveFileIcon,
	AudioFileIcon,
	CodeFileIcon,
	CsvFileIcon,
	ExcelFileIcon,
	ImageFileIcon,
	PdfFileIcon,
	PowerPointFileIcon,
	TextFileIcon,
	VideoFileIcon,
	WordFileIcon,
} from "../FileIcons";
import { combineClassNames, getFileExt } from "../../../utils";
import dataToFile from "../../../utils/dataToFile";

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
	/**
	 * Display file as...
	 * - box: Box with label below
	 * - list: Full width list
	 * - compact-list: List with compact width, display inline block
	 */
	variant: "box" | "list" | "compact-list";
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
		closeIconList: {
			width: "auto",
			position: "static",
			cursor: "pointer",
			color: theme.palette.action.active,
		},
		icon: {
			width: "100%",
			height: "auto",
			marginTop: 16,
		},
		iconList: {
			height: "100%",
			width: "auto",
			color: theme.palette.error.main,
		},
		iconDisabled: {
			opacity: 0.5,
		},
		listEntryText: {
			minWidth: 0,
			position: "relative",
		},
		listLabel: {
			position: "absolute",
			maxWidth: "100%",
		},
		compactListWrapper: {
			maxWidth: "100%",
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

export const ExcelFileExtensions = [
	"xlsx",
	"xlsm",
	"xltx",
	"xltm",
	"xls",
	"xlt",
	"xlm",
];

export const WordFileExtensions = [
	"doc",
	"dot",
	"docx",
	"docm",
	"dotx",
	"dotm",
	"docb",
];

export const PowerPointFileExtensions = [
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

export const ArchiveFileExtensions = ["zip", "7z", "rar", "tar"];
export const AudioFileExtensions = ["mp3", "wav", "ogg"];
export const ImageFileExtensions = [
	"jpg",
	"jpeg",
	"png",
	"gif",
	"bmp",
	"svg",
	"webp",
];
export const CodeFileExtensions = [
	"js",
	"jsx",
	"ts",
	"tsx",
	"cs",
	"c",
	"cpp",
	"cxx",
	"h",
	"hpp",
	"py",
	"pyw",
	"rb",
	"html",
	"xml",
	"css",
	"php",
];
export const CsvFileExtensions = ["csv"];
export const TextFileExtensions = ["txt"];
export const VideoFileExtensions = ["mp4", "mkv", "avi"];

export const AudioMimeType = /^audio\//;
export const ImageMimeType = /^image\//;
export const VideoMimeType = /^video\//;
export const PdfFileExtensions = ["pdf"];

export const getFileIcon = (
	nameOrMime: string
): React.ComponentType<SvgIconProps> | null => {
	if (nameOrMime.includes("/")) {
		if (AudioMimeType.test(nameOrMime)) return AudioFileIcon;
		if (ImageMimeType.test(nameOrMime)) return ImageFileIcon;
		if (VideoMimeType.test(nameOrMime)) return VideoFileIcon;
		return null;
	} else {
		const fileExt = getFileExt(nameOrMime).toLowerCase();
		if (ArchiveFileExtensions.includes(fileExt)) return ArchiveFileIcon;
		if (AudioFileExtensions.includes(fileExt)) return AudioFileIcon;
		if (CodeFileExtensions.includes(fileExt)) return CodeFileIcon;
		if (CsvFileExtensions.includes(fileExt)) return CsvFileIcon;
		if (ExcelFileExtensions.includes(fileExt)) return ExcelFileIcon;
		if (ImageFileExtensions.includes(fileExt)) return ImageFileIcon;
		if (PdfFileExtensions.includes(fileExt)) return PdfFileIcon;
		if (PowerPointFileExtensions.includes(fileExt)) return PowerPointFileIcon;
		if (TextFileExtensions.includes(fileExt)) return TextFileIcon;
		if (VideoFileExtensions.includes(fileExt)) return VideoFileIcon;
		if (WordFileExtensions.includes(fileExt)) return WordFileIcon;
		return null;
	}
};

export const getFileIconOrDefault = (
	nameOrMime: string
): React.ComponentType<SvgIconProps> =>
	getFileIcon(nameOrMime) ?? DefaultFileIcon;

const File = (props: FileProps) => {
	const { downloadLink, variant } = props;
	const classes = useStyles(props);

	const FileIcon = getFileIconOrDefault(props.name);

	const openDownload = useCallback(() => {
		if (downloadLink) {
			if (downloadLink.startsWith("data:")) {
				const url = URL.createObjectURL(dataToFile(downloadLink));
				window.open(url, "_blank");
				URL.revokeObjectURL(url);
			} else {
				window.open(downloadLink, "_blank");
			}
		}
	}, [downloadLink]);

	const handleListClick = useCallback((evt: React.MouseEvent) => {
		evt.stopPropagation();
	}, []);

	const isList = variant === "list" || variant === "compact-list";
	const renderIcon = () =>
		props.preview ? (
			<img
				src={props.preview}
				alt={props.name}
				className={combineClassNames([
					isList ? classes.iconList : classes.icon,
					props.disabled && classes.iconDisabled,
					downloadLink && classes.clickable,
				])}
				onClick={openDownload}
				style={isList ? { height: props.size } : undefined}
			/>
		) : (
			<FileIcon
				className={combineClassNames([
					isList ? classes.iconList : classes.icon,
					downloadLink && classes.clickable,
				])}
				onClick={openDownload}
				style={isList ? { height: props.size } : undefined}
			/>
		);

	const renderName = () => (
		<Tooltip title={props.name}>
			<Typography
				align={isList ? "left" : "center"}
				noWrap
				className={combineClassNames([
					downloadLink && classes.downloadLink,
					variant === "list" && classes.listLabel,
				])}
				onClick={openDownload}
				variant={"body2"}
				style={
					isList
						? {
								lineHeight: `${props.size}px`,
						  }
						: undefined
				}
			>
				{props.name}
			</Typography>
		</Tooltip>
	);

	const renderRemove = () =>
		props.onRemove &&
		!props.disabled &&
		React.createElement(variant === "list" ? CancelIconList : CancelIcon, {
			className: combineClassNames([
				variant === "box" && classes.closeIcon,
				variant === "list" && classes.closeIconList,
			]),
			onClick: props.onRemove,
			style: variant === "list" ? { height: props.size } : undefined,
		});

	if (variant === "box") {
		return (
			<Grid item style={{ width: props.size }}>
				<Grid container spacing={2}>
					<Grid item xs={12} className={classes.iconContainer}>
						{renderRemove()}
						{renderIcon()}
					</Grid>
					<Grid item xs={12}>
						{renderName()}
					</Grid>
				</Grid>
			</Grid>
		);
	} else if (variant === "list") {
		return (
			<Grid
				item
				xs={12}
				onClick={handleListClick}
				container
				spacing={2}
				alignItems={"stretch"}
				wrap={"nowrap"}
			>
				<Grid item>{renderIcon()}</Grid>
				<Grid item xs className={classes.listEntryText}>
					{renderName()}
				</Grid>
				<Grid item>{renderRemove()}</Grid>
			</Grid>
		);
	} else if (variant === "compact-list") {
		return (
			<Grid
				item
				onClick={handleListClick}
				className={classes.compactListWrapper}
			>
				<Grid container spacing={2} alignItems={"stretch"} wrap={"nowrap"}>
					<Grid item>{renderIcon()}</Grid>
					<Grid item className={classes.listEntryText}>
						{renderName()}
					</Grid>
					<Grid item>{renderRemove()}</Grid>
				</Grid>
			</Grid>
		);
	} else {
		throw new Error("Invalid variant passed");
	}
};

export default React.memo(File);
