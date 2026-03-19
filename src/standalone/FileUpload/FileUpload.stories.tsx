import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, within } from "storybook/test";
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
// Helpers
// ---------------------------------------------------------------------------

const makeColorImage = (color: string, accent: string, size = 128): string => {
	const canvas = document.createElement("canvas");
	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext("2d");
	// background
	ctx.fillStyle = color;
	ctx.fillRect(0, 0, size, size);
	// checkerboard
	ctx.fillStyle = accent;
	const cell = size / 8;
	for (let r = 0; r < 8; r++) {
		for (let c = 0; c < 8; c++) {
			if ((r + c) % 2 === 0) ctx.fillRect(c * cell, r * cell, cell, cell);
		}
	}
	// diagonal cross
	ctx.strokeStyle = accent;
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.lineTo(size, size);
	ctx.moveTo(size, 0);
	ctx.lineTo(0, size);
	ctx.stroke();
	// center circle
	ctx.beginPath();
	ctx.arc(size / 2, size / 2, size / 4, 0, Math.PI * 2);
	ctx.fillStyle = color;
	ctx.fill();
	ctx.stroke();
	return canvas.toDataURL("image/png");
};

// ---------------------------------------------------------------------------
// ImageSelector stories
// ---------------------------------------------------------------------------

export const ImageSelectorModern: StoryObj = {
	name: "ImageSelector — modern (with preview dialog)",
	render: () => {
		const [value, setValue] = useState(makeColorImage("#e53935", "#ffcdd2"));
		return (
			<div style={{ width: 300, height: 200 }}>
				<ImageSelector
					name="photo"
					value={value}
					capture={false}
					alt="Photo"
					label="Photo (modern — click image to preview)"
					readOnly={false}
					variant="modern"
					onChange={(_name, val) => {
						setValue(val);
					}}
				/>
			</div>
		);
	},
};

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
		const placeholder = makeColorImage("#ccc", "#999");

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
		const redImage = makeColorImage("#e53935", "#ffcdd2");
		const greenImage = makeColorImage("#43a047", "#c8e6c9");
		const initialImages: MultiImageImage[] = [
			{ id: "img-1", image: redImage, name: "red.png" },
			{ id: "img-2", image: greenImage, name: "green.png" },
		];

		const [images, setImages] = useState<MultiImageImage[]>(initialImages);

		const [primary, setPrimary] = useState<string | null>("img-1");
		return (
			<div style={{ width: 300, height: 300 }}>
				<MultiImage
					label="Product images"
					images={images}
					primary={primary}
					uploadImage={redImage}
					captureImage={redImage}
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

export const MultiImageWheelDoesNotSwitchImage: StoryObj = {
	name: "MultiImage — wheel zoom must not switch image",
	render: () => {
		const redImage = makeColorImage("#e53935", "#ffcdd2");
		const greenImage = makeColorImage("#43a047", "#c8e6c9");
		const initialImages: MultiImageImage[] = [
			{ id: "img-1", image: redImage, name: "red.png" },
			{ id: "img-2", image: greenImage, name: "green.png" },
		];
		const [images, setImages] = useState<MultiImageImage[]>(initialImages);
		const [primary, setPrimary] = useState<string | null>("img-1");
		return (
			<div style={{ width: 300, height: 300 }}>
				<MultiImage
					label="Wheel test"
					images={images}
					primary={primary}
					uploadImage={redImage}
					captureImage={redImage}
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
	play: async ({ canvasElement, userEvent }) => {
		// Click the first image to open the fullscreen dialog
		const previewImage = canvasElement.querySelector("img");
		if (!previewImage) throw new Error("preview img not found");
		await userEvent.click(previewImage);

		// Find the dialog (rendered in a portal)
		const body = within(document.body);
		const dialog = await body.findByRole("dialog");

		// Find the dialog image
		const dialogImg = dialog.querySelector("img");
		if (!dialogImg) throw new Error("dialog img not found");
		const initialSrc = dialogImg.getAttribute("src");

		// Click next arrow to go to second image
		const arrowIcon = dialog.querySelector("[data-testid='ArrowForwardIcon']");
		if (!arrowIcon) throw new Error("ArrowForwardIcon not found");
		const nextButton = arrowIcon.closest("button");
		if (!nextButton) throw new Error("next button not found");
		await userEvent.click(nextButton);

		// Wait for image to update and scroll reset to settle
		await new Promise((r) => setTimeout(r, 500));
		const secondSrc = dialogImg.getAttribute("src");
		await expect(secondSrc).not.toBe(initialSrc);

		// Fire a wheel-up event (zoom in) on the zoom container.
		// stopPropagation prevents it from reaching the SwipeListener.
		const zoomContainer = dialogImg.parentElement;
		if (!zoomContainer) throw new Error("zoom container not found");
		zoomContainer.dispatchEvent(
			new WheelEvent("wheel", {
				deltaY: -120,
				bubbles: true,
				cancelable: true,
			}),
		);

		// Wait for any scroll handlers to fire
		await new Promise((r) => setTimeout(r, 500));

		// The image src must still be the second image — not switched back
		const srcAfterWheel = dialogImg.getAttribute("src");
		await expect(srcAfterWheel).toBe(secondSrc);
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
