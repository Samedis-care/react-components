import React, { useCallback } from "react";
import {
	Grid,
	styled,
	SvgIconProps,
	Tooltip,
	Typography,
	useThemeProps,
} from "@mui/material";
import {
	Cancel as CancelIconList,
	CancelOutlined as CancelIcon,
	InsertDriveFile as DefaultFileIcon,
} from "@mui/icons-material";
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
import dataToFile from "../../../utils/dataToFile";
import combineClassNames from "../../../utils/combineClassNames";
import getFileExt from "../../../utils/getFileExt";

export interface FileProps {
	/**
	 * The file name, including extension
	 */
	name: string;
	/**
	 * the file label
	 */
	label?: string;
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
	 * CSS class to apply to root element
	 */
	className?: string;
	/**
	 * Custom styles
	 */
	classes?: Partial<Record<FileClassKey, string>>;
	/**
	 * Display file as...
	 * - box: Box with label below
	 * - list: Full width list
	 * - compact-list: List with compact width, display inline block
	 * - icon only compact list - file name as tooltip, best used with read-only
	 */
	variant: "box" | "list" | "compact-list" | "icon-only";
}

const CompactListWrapper = styled(Grid, {
	name: "CcFile",
	slot: "compactListWrapper",
})({
	maxWidth: "100%",
});

const IconContainer = styled(Grid, { name: "CcFile", slot: "iconContainer" })({
	position: "relative",
});

const ListEntryText = styled(Grid, { name: "CcFile", slot: "listEntryText" })({
	minWidth: 0,
	position: "relative",
});

const CloseIconList = styled(CancelIconList, {
	name: "CcFile",
	slot: "closeIconList",
})(({ theme }) => ({
	width: "auto",
	position: "static",
	cursor: "pointer",
	color: theme.palette.action.active,
}));

const CloseIcon = styled(CancelIcon, {
	name: "CcFile",
	slot: "closeIcon",
})(({ theme }) => ({
	position: "absolute",
	cursor: "pointer",
	color: theme.palette.error.main,
}));

const RemoveIcon = styled(CancelIcon, {
	name: "CcFile",
	slot: "removeIcon",
})({
	cursor: "pointer",
});

const IconWrapperList = styled("div", {
	name: "CcFile",
	slot: "iconWrapperList",
})(({ theme }) => ({
	height: "100%",
	width: "auto",
	color: theme.palette.error.main,
	"&.Mui-disabled": {
		opacity: 0.5,
	},
	"&.Mui-active": {
		cursor: "pointer",
	},
}));

const IconWrapper = styled("div", {
	name: "CcFile",
	slot: "iconWrapper",
})({
	width: "100%",
	height: "auto",
	marginTop: 16,
	objectFit: "contain",
});

const StyledLabelList = styled(Typography, {
	name: "CcFile",
	slot: "listLabel",
})({
	position: "absolute",
	maxWidth: "100%",
	"&.Mui-active": {
		cursor: "pointer",
		"&:hover": {
			textDecoration: "underline",
		},
	},
});

const StyledLabel = styled(Typography, {
	name: "CcFile",
	slot: "label",
})({
	"&.Mui-active": {
		cursor: "pointer",
		"&:hover": {
			textDecoration: "underline",
		},
	},
});

export type FileClassKey =
	| "compactListWrapper"
	| "iconContainer"
	| "listEntryText"
	| "closeIconList"
	| "closeIcon"
	| "removeIcon"
	| "iconWrapperList"
	| "iconWrapper"
	| "listLabel"
	| "label";

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

export type FileType =
	| "archive"
	| "audio"
	| "code"
	| "csv"
	| "excel"
	| "image"
	| "pdf"
	| "power-point"
	| "text"
	| "video"
	| "word"
	| null;

export const getFileType = (nameOrMime: string): FileType => {
	if (nameOrMime.includes("/")) {
		if (AudioMimeType.test(nameOrMime)) return "audio";
		if (ImageMimeType.test(nameOrMime)) return "image";
		if (VideoMimeType.test(nameOrMime)) return "video";
		return null;
	} else {
		const fileExt = getFileExt(nameOrMime).toLowerCase();
		if (ArchiveFileExtensions.includes(fileExt)) return "archive";
		if (AudioFileExtensions.includes(fileExt)) return "audio";
		if (CodeFileExtensions.includes(fileExt)) return "code";
		if (CsvFileExtensions.includes(fileExt)) return "csv";
		if (ExcelFileExtensions.includes(fileExt)) return "excel";
		if (ImageFileExtensions.includes(fileExt)) return "image";
		if (PdfFileExtensions.includes(fileExt)) return "pdf";
		if (PowerPointFileExtensions.includes(fileExt)) return "power-point";
		if (TextFileExtensions.includes(fileExt)) return "text";
		if (VideoFileExtensions.includes(fileExt)) return "video";
		if (WordFileExtensions.includes(fileExt)) return "word";
		return null;
	}
};

export const getFileIcon = (
	nameOrMime: string,
): React.ComponentType<SvgIconProps> | null => {
	return getFileTypeIcon(getFileType(nameOrMime));
};

export const getFileTypeIcon = (
	type: FileType,
): React.ComponentType<SvgIconProps> | null => {
	switch (type) {
		case "archive":
			return ArchiveFileIcon;
		case "audio":
			return AudioFileIcon;
		case "code":
			return CodeFileIcon;
		case "csv":
			return CsvFileIcon;
		case "excel":
			return ExcelFileIcon;
		case "image":
			return ImageFileIcon;
		case "pdf":
			return PdfFileIcon;
		case "power-point":
			return PowerPointFileIcon;
		case "text":
			return TextFileIcon;
		case "video":
			return VideoFileIcon;
		case "word":
			return WordFileIcon;
		default:
			return null;
	}
};

export const getFileIconOrDefault = (
	nameOrMime: string,
): React.ComponentType<SvgIconProps> =>
	getFileIcon(nameOrMime) ?? DefaultFileIcon;

const File = (inProps: FileProps) => {
	const props = useThemeProps({ props: inProps, name: "CcFile" });
	const { downloadLink, variant, className, classes } = props;

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

	const isList =
		variant === "list" || variant === "compact-list" || variant === "icon-only";
	const renderIcon = () => {
		const IconWrapperComp = isList ? IconWrapperList : IconWrapper;
		return (
			<IconWrapperComp
				className={combineClassNames([
					isList ? classes?.iconWrapperList : classes?.iconWrapper,
					props.disabled && "Mui-disabled",
					downloadLink && "Mui-active",
				])}
			>
				{props.preview ? (
					<img
						src={props.preview}
						alt={props.name}
						onClick={openDownload}
						style={{ height: props.size }}
					/>
				) : (
					<FileIcon onClick={openDownload} style={{ height: props.size }} />
				)}
			</IconWrapperComp>
		);
	};

	const renderName = () => {
		const TypographyComp = variant === "list" ? StyledLabelList : StyledLabel;

		return (
			<Tooltip title={props.name}>
				<TypographyComp
					align={isList ? "left" : "center"}
					noWrap
					className={combineClassNames([
						variant === "list" ? classes?.listLabel : classes?.label,
						downloadLink && "Mui-active",
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
					{props.label ?? props.name}
				</TypographyComp>
			</Tooltip>
		);
	};

	const removeBtn =
		props.onRemove &&
		!props.disabled &&
		React.createElement(
			variant === "list"
				? CloseIconList
				: variant === "box"
					? CloseIcon
					: RemoveIcon,
			{
				className: combineClassNames([
					variant === "box" && classes?.closeIcon,
					variant === "list" && classes?.closeIconList,
					variant !== "box" && variant !== "list" && classes?.removeIcon,
				]),
				onClick: props.onRemove,
				style: variant === "list" ? { height: props.size } : undefined,
			},
		);

	if (variant === "box") {
		return (
			<Grid item className={className} style={{ width: props.size }}>
				<Grid container spacing={2}>
					<IconContainer item xs={12} className={classes?.iconContainer}>
						{removeBtn}
						{renderIcon()}
					</IconContainer>
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
				className={className}
			>
				<Grid item>{renderIcon()}</Grid>
				<ListEntryText item xs className={classes?.listEntryText}>
					{renderName()}
				</ListEntryText>
				{removeBtn && <Grid item>{removeBtn}</Grid>}
			</Grid>
		);
	} else if (variant === "compact-list") {
		return (
			<CompactListWrapper
				item
				onClick={handleListClick}
				className={combineClassNames([className, classes?.compactListWrapper])}
			>
				<Grid container spacing={2} alignItems={"stretch"} wrap={"nowrap"}>
					<Grid item>{renderIcon()}</Grid>
					<ListEntryText item className={classes?.listEntryText}>
						{renderName()}
					</ListEntryText>
					{removeBtn && <Grid item>{removeBtn}</Grid>}
				</Grid>
			</CompactListWrapper>
		);
	} else if (variant === "icon-only") {
		return (
			<CompactListWrapper
				item
				onClick={handleListClick}
				className={combineClassNames([className, classes?.compactListWrapper])}
			>
				<Grid container spacing={2} alignItems={"stretch"} wrap={"nowrap"}>
					<Grid item>
						<Tooltip title={props.name}>
							<span>{renderIcon()}</span>
						</Tooltip>
					</Grid>
					{removeBtn && <Grid item>{removeBtn}</Grid>}
				</Grid>
			</CompactListWrapper>
		);
	} else {
		throw new Error("Invalid variant passed");
	}
};

export default React.memo(File);
