import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileUploadGeneric, ImageSelector } from "./index";
import type { FileData, FileMeta } from "./Generic";
import type { MultiImageImage } from "./MultiImage/MultiImage";
import { MultiImage } from "./MultiImage";
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
} from "./FileIcons";
import { Grid, Typography } from "@mui/material";
import { getFileType, getFileIconOrDefault } from "./Generic/File";

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof FileUploadGeneric> = {
	title: "standalone/FileUpload",
	component: FileUploadGeneric,
	parameters: { layout: "centered" },
};
export default meta;

// ---------------------------------------------------------------------------
// FileUploadGeneric stories
// ---------------------------------------------------------------------------

type FUGStory = StoryObj<typeof FileUploadGeneric>;

export const BasicClassic: FUGStory = {
	name: "FileUploadGeneric — classic",
	render: () => {
		const [files, setFiles] = useState<FileData[]>([]);
		return (
			<FileUploadGeneric
				files={files}
				onChange={(f) => {
					setFiles(f);
				}}
				label="Upload files"
				previewSize={64}
				handleError={() => {}}
			/>
		);
	},
};

export const WithMaxFiles: FUGStory = {
	name: "FileUploadGeneric — maxFiles=3, accept=image/*",
	render: () => {
		const [files, setFiles] = useState<FileData[]>([]);
		return (
			<FileUploadGeneric
				files={files}
				onChange={(f) => {
					setFiles(f);
				}}
				label="Upload up to 3 images"
				maxFiles={3}
				accept="image/*"
				previewSize={64}
				handleError={() => {}}
			/>
		);
	},
};

export const ModernVariant: FUGStory = {
	name: "FileUploadGeneric — modern variant",
	render: () => {
		const [files, setFiles] = useState<FileData[]>([]);
		return (
			<FileUploadGeneric
				files={files}
				onChange={(f) => {
					setFiles(f);
				}}
				label="Drop or click to upload"
				variant="modern"
				accept="image/*,.pdf"
				previewSize={24}
				handleError={() => {}}
			/>
		);
	},
};

export const ReadOnly: FUGStory = {
	name: "FileUploadGeneric — read-only with existing files",
	render: () => {
		const existingFiles: FileData<FileMeta>[] = [
			{
				file: { name: "document.pdf", type: "application/pdf" },
				canBeUploaded: false,
				delete: false,
			},
			{
				file: {
					name: "spreadsheet.xlsx",
					type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				},
				canBeUploaded: false,
				delete: false,
			},
		];
		return (
			<FileUploadGeneric
				files={existingFiles}
				label="Attachments (read-only)"
				readOnly
				previewSize={64}
				handleError={() => {}}
			/>
		);
	},
};

// ---------------------------------------------------------------------------
// ImageSelector stories
// ---------------------------------------------------------------------------

export const ImageSelectorEmpty: StoryObj = {
	name: "ImageSelector — empty",
	render: () => {
		const [value, setValue] = useState("");
		return (
			<div style={{ width: 300, height: 200 }}>
				<ImageSelector
					name="avatar"
					value={value}
					capture={false}
					alt="Profile picture"
					label="Profile picture"
					readOnly={false}
					onChange={(_name, val) => {
						setValue(val);
					}}
				/>
			</div>
		);
	},
};

export const ImageSelectorWithValue: StoryObj = {
	name: "ImageSelector — with value",
	render: () => {
		const redPixel =
			"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==";

		const [value, setValue] = useState(redPixel);
		return (
			<div style={{ width: 300, height: 200 }}>
				<ImageSelector
					name="avatar"
					value={value}
					capture={false}
					alt="Profile picture"
					label="Profile picture (pre-loaded)"
					readOnly={false}
					onChange={(_name, val) => {
						setValue(val);
					}}
				/>
			</div>
		);
	},
};

export const ImageSelectorReadOnly: StoryObj = {
	name: "ImageSelector — read-only",
	render: () => {
		const redPixel =
			"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==";
		return (
			<div style={{ width: 300, height: 200 }}>
				<ImageSelector
					name="avatar"
					value={redPixel}
					capture={false}
					alt="Profile picture"
					label="Profile picture (read-only)"
					readOnly={true}
				/>
			</div>
		);
	},
};

// ---------------------------------------------------------------------------
// MultiImage stories
// ---------------------------------------------------------------------------

export const MultiImageEmpty: StoryObj = {
	name: "MultiImage — empty",
	render: () => {
		const placeholder =
			"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

		const [images, setImages] = useState<MultiImageImage[]>([]);

		const [primary, setPrimary] = useState<string | null>(null);
		return (
			<div style={{ width: 300, height: 300 }}>
				<MultiImage
					label="Images"
					images={images}
					primary={primary}
					uploadImage={placeholder}
					captureImage={placeholder}
					placeholderImage={placeholder}
					onChange={(_name, imgs) => {
						setImages(imgs);
					}}
					onPrimaryChange={(_name, p) => {
						setPrimary(p);
					}}
				/>
			</div>
		);
	},
};

export const MultiImageWithImages: StoryObj = {
	name: "MultiImage — with images",
	render: () => {
		const redPixel =
			"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==";
		const greenPixel =
			"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
		const initialImages: MultiImageImage[] = [
			{ id: "img-1", image: redPixel, name: "red.png" },
			{ id: "img-2", image: greenPixel, name: "green.png" },
		];

		const [images, setImages] = useState<MultiImageImage[]>(initialImages);

		const [primary, setPrimary] = useState<string | null>("img-1");
		return (
			<div style={{ width: 300, height: 300 }}>
				<MultiImage
					label="Product images"
					images={images}
					primary={primary}
					uploadImage={redPixel}
					captureImage={redPixel}
					onChange={(_name, imgs) => {
						setImages(imgs);
					}}
					onPrimaryChange={(_name, p) => {
						setPrimary(p);
					}}
				/>
			</div>
		);
	},
};

// ---------------------------------------------------------------------------
// FileIcons gallery
// ---------------------------------------------------------------------------

const fileIconRows: { label: string; component: React.ComponentType }[] = [
	{ label: "Archive (.zip, .rar, ...)", component: ArchiveFileIcon },
	{ label: "Audio (.mp3, .wav, ...)", component: AudioFileIcon },
	{ label: "Code (.js, .ts, .py, ...)", component: CodeFileIcon },
	{ label: "CSV (.csv)", component: CsvFileIcon },
	{ label: "Excel (.xlsx, .xls, ...)", component: ExcelFileIcon },
	{ label: "Image (.jpg, .png, ...)", component: ImageFileIcon },
	{ label: "PDF (.pdf)", component: PdfFileIcon },
	{ label: "PowerPoint (.pptx, ...)", component: PowerPointFileIcon },
	{ label: "Text (.txt)", component: TextFileIcon },
	{ label: "Video (.mp4, .mkv, ...)", component: VideoFileIcon },
	{ label: "Word (.docx, .doc, ...)", component: WordFileIcon },
];

export const FileIconsGallery: StoryObj = {
	name: "FileIcons — gallery",
	render: () => (
		<Grid container spacing={2} alignItems="center">
			{fileIconRows.map(({ label, component: Icon }) => (
				<React.Fragment key={label}>
					<Grid size={2}>
						<Icon style={{ fontSize: 40 }} />
					</Grid>
					<Grid size={10}>
						<Typography variant="body2">{label}</Typography>
					</Grid>
				</React.Fragment>
			))}
		</Grid>
	),
};

export const GetFileIconOrDefaultDemo: StoryObj = {
	name: "getFileIconOrDefault — various MIME types",
	render: () => {
		const examples: { mime: string; name: string }[] = [
			{ mime: "application/pdf", name: "report.pdf" },
			{ mime: "image/png", name: "photo.png" },
			{ mime: "audio/mp3", name: "song.mp3" },
			{ mime: "video/mp4", name: "clip.mp4" },
			{
				mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				name: "data.xlsx",
			},
			{ mime: "application/zip", name: "archive.zip" },
			{ mime: "text/plain", name: "readme.txt" },
			{ mime: "application/octet-stream", name: "binary.bin" },
		];
		return (
			<Grid container spacing={2} alignItems="center">
				{examples.map(({ mime, name }) => {
					const Icon = getFileIconOrDefault(name, mime);
					const type = getFileType(name, mime);
					return (
						<React.Fragment key={`${name}-${mime}`}>
							<Grid size={1}>
								<Icon style={{ fontSize: 32 }} />
							</Grid>
							<Grid size={5}>
								<Typography variant="body2">{name}</Typography>
							</Grid>
							<Grid size={6}>
								<Typography variant="caption" color="textSecondary">
									{mime} → {type ?? "default"}
								</Typography>
							</Grid>
						</React.Fragment>
					);
				})}
			</Grid>
		);
	},
};
