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
	 * Mime Type of the file
	 */
	mimeType: string;
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
	/**
	 * custom onClick handler
	 * @param name The file name including extension
	 * @param url The file URL
	 */
	onClick?: (name: string, url: string) => Promise<void> | void;
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
export const ExcelMimeType = [
	"application/vnd.ms-excel",
	"application/vnd.ms-excel.addin.macroenabled.12",
	"application/vnd.ms-excel.sheet.binary.macroenabled.12",
	"application/vnd.ms-excel.sheet.macroenabled.12",
	"application/vnd.ms-excel.template.macroenabled.12",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.template",
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

export const WordMimeType = [
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.template",
	"application/msword",
	"application/vnd.ms-word.document.macroenabled.12",
	"application/vnd.ms-word.template.macroenabled.12",
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
export const PowerPointMimeType = [
	"application/vnd.ms-powerpoint",
	"application/vnd.ms-powerpoint.addin.macroenabled.12",
	"application/vnd.ms-powerpoint.presentation.macroenabled.12",
	"application/vnd.ms-powerpoint.slide.macroenabled.12",
	"application/vnd.ms-powerpoint.slideshow.macroenabled.12",
	"application/vnd.ms-powerpoint.template.macroenabled.12",
	"application/vnd.openxmlformats-officedocument.presentationml.presentation",
	"application/vnd.openxmlformats-officedocument.presentationml.slide",
	"application/vnd.openxmlformats-officedocument.presentationml.slideshow",
	"application/vnd.openxmlformats-officedocument.presentationml.template",
];

export const ArchiveFileExtensions = ["zip", "7z", "rar", "tar"];
export const ArchiveMimeType = [
	"application/x-zip-compressed",
	"application/zip",
	"application/zip-compressed",
	"application/x-7z-compressed",
	"application/x-rar-compressed",
	"application/vnd.rar",
	"application/x-tar",
];
export const AudioFileExtensions = [
	"acc",
	"mp3",
	"wav",
	"ogg",
	"oga",
	"opus",
	"weba",
];
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
export const CodeMimeType = [
	"text/javascript",
	"text/css",
	"text/html",
	"application/xml",
];
export const CsvFileExtensions = ["csv"];
export const TextFileExtensions = ["txt"];
export const TextFileMimeType = ["text/plain"];
export const VideoFileExtensions = [
	"mp4",
	"mov",
	"mkv",
	"avi",
	"mpeg",
	"ogv",
	"webm",
	"3gp",
	"3g2",
];

export const AudioMimeType = /^audio\//;
export const ImageMimeType = /^image\//;
export const VideoMimeType = /^video\//;
export const PdfFileExtensions = ["pdf"];
export const PdfMimeType = ["application/pdf"];
export const CsvMimeType = ["text/csv"];

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

export const getFileType = (
	fileName: string | null,
	mimeType: string | null,
): FileType => {
	if (mimeType && mimeType.includes("/")) {
		if (ArchiveMimeType.includes(mimeType)) return "archive";
		if (AudioMimeType.test(mimeType)) return "audio";
		if (CodeMimeType.includes(mimeType)) return "code";
		if (CsvMimeType.includes(mimeType)) return "csv";
		if (ExcelMimeType.includes(mimeType)) return "excel";
		if (ImageMimeType.test(mimeType)) return "image";
		if (PdfMimeType.includes(mimeType)) return "pdf";
		if (PowerPointMimeType.includes(mimeType)) return "power-point";
		if (TextFileMimeType.includes(mimeType)) return "text";
		if (VideoMimeType.test(mimeType)) return "video";
		if (WordMimeType.includes(mimeType)) return "word";
	}
	if (fileName) {
		const fileExt = getFileExt(fileName).toLowerCase();
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
	}
	return null;
};

export const getFileIcon = (
	fileName: string | null,
	mimeType: string | null,
): React.ComponentType<SvgIconProps> | null => {
	return getFileTypeIcon(getFileType(fileName, mimeType));
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
	fileName: string | null,
	mimeType: string | null,
): React.ComponentType<SvgIconProps> =>
	getFileIcon(fileName, mimeType) ?? DefaultFileIcon;

const File = (inProps: FileProps) => {
	const props = useThemeProps({ props: inProps, name: "CcFile" });
	const { name, downloadLink, variant, className, classes, onClick } = props;

	const FileIcon = getFileIconOrDefault(props.name, props.mimeType);

	const openDownload = useCallback(async () => {
		if (downloadLink) {
			if (downloadLink.startsWith("data:")) {
				const url = URL.createObjectURL(dataToFile(downloadLink));
				if (onClick) await onClick(name, url);
				else window.open(url, "_blank");
				URL.revokeObjectURL(url);
			} else {
				if (onClick) await onClick(name, downloadLink);
				else window.open(downloadLink, "_blank");
			}
		}
	}, [downloadLink, name, onClick]);

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
			<Grid className={className} style={{ width: props.size }}>
				<Grid container spacing={2}>
					<IconContainer size={12} className={classes?.iconContainer}>
						{removeBtn}
						{renderIcon()}
					</IconContainer>
					<Grid size={12}>{renderName()}</Grid>
				</Grid>
			</Grid>
		);
	} else if (variant === "list") {
		return (
			<Grid
				onClick={handleListClick}
				container
				spacing={2}
				alignItems={"stretch"}
				wrap={"nowrap"}
				className={className}
				size={12}
			>
				<Grid>{renderIcon()}</Grid>
				<ListEntryText size={"grow"} className={classes?.listEntryText}>
					{renderName()}
				</ListEntryText>
				{removeBtn && <Grid>{removeBtn}</Grid>}
			</Grid>
		);
	} else if (variant === "compact-list") {
		return (
			<CompactListWrapper
				onClick={handleListClick}
				className={combineClassNames([className, classes?.compactListWrapper])}
			>
				<Grid container spacing={2} alignItems={"stretch"} wrap={"nowrap"}>
					<Grid>{renderIcon()}</Grid>
					<ListEntryText className={classes?.listEntryText}>
						{renderName()}
					</ListEntryText>
					{removeBtn && <Grid>{removeBtn}</Grid>}
				</Grid>
			</CompactListWrapper>
		);
	} else if (variant === "icon-only") {
		return (
			<CompactListWrapper
				onClick={handleListClick}
				className={combineClassNames([className, classes?.compactListWrapper])}
			>
				<Grid container spacing={2} alignItems={"stretch"} wrap={"nowrap"}>
					<Grid>
						<Tooltip title={props.name}>
							<span>{renderIcon()}</span>
						</Tooltip>
					</Grid>
					{removeBtn && <Grid>{removeBtn}</Grid>}
				</Grid>
			</CompactListWrapper>
		);
	} else {
		throw new Error("Invalid variant passed");
	}
};

export default React.memo(File);
