import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { FileUploadGeneric, ImageSelector } from "./index";
import type { FileData, FileMeta, FileUploadProps } from "./Generic";
import type { MultiImageImage, MultiImageProps } from "./MultiImage/MultiImage";
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
import { Alert, Grid, Typography, type SvgIconProps } from "@mui/material";
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

/**
 * A PNG of random pixels, which PNG cannot compress, so it is far larger than the same
 * picture down-scaled
 */
const makeNoisePhoto = async (name: string, size = 400): Promise<File> => {
	const canvas = document.createElement("canvas");
	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext("2d")!;
	const pixels = ctx.createImageData(size, size);
	for (let i = 0; i < pixels.data.length; i++) {
		pixels.data[i] = i % 4 === 3 ? 255 : Math.floor(Math.random() * 256);
	}
	ctx.putImageData(pixels, 0, 0);
	const blob = await new Promise<Blob>((resolve, reject) =>
		canvas.toBlob(
			(result) => (result ? resolve(result) : reject(new Error("toBlob"))),
			"image/png",
		),
	);
	return new File([blob], name, { type: "image/png" });
};

/**
 * Size limits per file and for all files together. A selection outside them is refused
 * as a whole, with a message naming the file and the limit. A photo counts at the size
 * it is uploaded with, after down-scaling.
 */
export const SizeLimits: FUGStory = {
	name: "FileUploadGeneric — size limits",
	args: {
		minFileSize: 1024,
		maxFileSize: 100 * 1024,
		maxTotalFileSize: 150 * 1024,
	},
	parameters: { a11y: { test: "error" } },
	render: (args) => {
		const [files, setFiles] = useState<FileData[]>([]);
		const [error, setError] = useState("");
		return (
			<div style={{ width: 480 }}>
				<FileUploadGeneric
					{...args}
					files={files}
					onChange={(f) => {
						setFiles(f);
						setError("");
					}}
					label="Attachments"
					previewSize={64}
					previewImages
					imageDownscaleOptions={{ width: 32, height: 32, keepRatio: true }}
					handleError={(_err, message) => setError(message)}
				/>
				<div role="alert">{error}</div>
			</div>
		);
	},
	play: async ({ canvas, canvasElement }) => {
		const input =
			canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!;

		const photo = await makeNoisePhoto("photo.png");
		await expect(photo.size).toBeGreaterThan(100 * 1024);
		await userEvent.upload(input, photo);
		// listed: what is uploaded is the 32 px version
		await expect(await canvas.findByText("photo.png")).toBeInTheDocument();
		await expect(canvas.getByRole("alert").textContent).toBe("");

		await userEvent.upload(
			input,
			new File(["x".repeat(100 * 1024 + 1)], "big.txt", { type: "text/plain" }),
		);
		await waitFor(() =>
			expect(canvas.getByRole("alert").textContent).toBe(
				'"big.txt" is too large. Each file may be at most 100\u00a0kB',
			),
		);
		await expect(canvas.queryByText("big.txt")).toBe(null);
	},
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeColorImage = (color: string, accent: string, size = 128): string => {
	const canvas = document.createElement("canvas");
	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext("2d")!;
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
		const [value, setValue] = useState<string | Blob>(
			makeColorImage("#e53935", "#ffcdd2"),
		);
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
		const [value, setValue] = useState<string | Blob>("");
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

		const [value, setValue] = useState<string | Blob>(redPixel);
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

/**
 * A file the browser can't decode as an image, like the HEIC photos an iPhone produces by default
 */
const makeUndecodableImage = () =>
	new File([new Uint8Array([0x00, 0x01, 0x02, 0x03])], "photo.heic", {
		type: "image/heic",
	});

export const ImageSelectorUnsupportedImage: StoryObj = {
	name: "ImageSelector — unsupported image reports an error",
	render: () => {
		const [value, setValue] = useState<string | Blob>("");
		const [error, setError] = useState("");
		const [errorName, setErrorName] = useState("");
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
					onError={(err, message) => {
						setError(message);
						setErrorName(err.name);
					}}
				/>
				<div data-testid="error-message">{error}</div>
				<div data-testid="error-name">{errorName}</div>
				<div data-testid="current-value">
					{typeof value === "string" ? value : "a picked image"}
				</div>
			</div>
		);
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const input =
			canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!;
		await expect(input).not.toBeNull();

		await userEvent.upload(input, makeUndecodableImage());

		// the failure has to become visible, silently doing nothing is the bug this guards against
		await waitFor(() =>
			expect(canvas.getByTestId("error-message").textContent).toBeTruthy(),
		);
		// and it has to be a real error, not an undefined rejection value
		await expect(canvas.getByTestId("error-name").textContent).toBe(
			"CcImageLoadError",
		);
		// and no broken value may be committed
		await expect(canvas.getByTestId("current-value").textContent).toBe("");
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

export const MultiImageUnsupportedImage: StoryObj = {
	name: "MultiImage — unsupported image reports an error",
	render: () => {
		const redImage = makeColorImage("#e53935", "#ffcdd2");
		const [images, setImages] = useState<MultiImageImage[]>([]);
		const [primary, setPrimary] = useState<string | null>(null);
		const [error, setError] = useState("");
		const [errorName, setErrorName] = useState("");
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
					onError={(err, message) => {
						setError(message);
						setErrorName(err.name);
					}}
				/>
				<div data-testid="error-message">{error}</div>
				<div data-testid="error-name">{errorName}</div>
				<div data-testid="image-count">{images.length}</div>
			</div>
		);
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const input =
			canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!;
		await expect(input).not.toBeNull();

		await userEvent.upload(input, makeUndecodableImage());

		await waitFor(() =>
			expect(canvas.getByTestId("error-message").textContent).toBeTruthy(),
		);
		await expect(canvas.getByTestId("error-name").textContent).toBe(
			"CcImageLoadError",
		);
		await expect(canvas.getByTestId("image-count").textContent).toBe("0");
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

export const MultiImageRotationResetsOnNextImage: StoryObj = {
	name: "MultiImage — rotation resets on the next image",
	render: () => {
		const redImage = makeColorImage("#e53935", "#ffcdd2");
		const greenImage = makeColorImage("#43a047", "#c8e6c9");
		const images: MultiImageImage[] = [
			{ id: "img-1", image: redImage, name: "red.png" },
			{ id: "img-2", image: greenImage, name: "green.png" },
		];
		return (
			<div style={{ width: 300, height: 300 }}>
				<MultiImage
					label="Rotation test"
					images={images}
					primary={"img-1"}
					uploadImage={redImage}
					captureImage={redImage}
					readOnly
				/>
			</div>
		);
	},
	play: async ({ canvasElement, userEvent }) => {
		const previewImage = canvasElement.querySelector("img");
		if (!previewImage) throw new Error("preview img not found");
		await userEvent.click(previewImage);

		const dialogElement = await within(document.body).findByRole("dialog");
		const dialog = within(dialogElement);
		const dialogImg = dialogElement.querySelector("img");
		if (!dialogImg) throw new Error("dialog img not found");
		const firstSrc = dialogImg.getAttribute("src");

		await userEvent.click(dialog.getByRole("button", { name: "Rotate right" }));
		await expect(dialogImg.style.transform).toContain("rotate(90deg)");

		await userEvent.click(dialog.getByRole("button", { name: "Next image" }));
		await waitFor(() =>
			expect(dialogImg.getAttribute("src")).not.toBe(firstSrc),
		);
		await expect(dialogImg.style.transform).toContain("rotate(0deg)");
	},
};

export const MultiImageWithoutRotation: StoryObj = {
	name: "MultiImage — disableRotation hides the rotate buttons",
	render: () => {
		const redImage = makeColorImage("#e53935", "#ffcdd2");
		const images: MultiImageImage[] = [
			{ id: "img-1", image: redImage, name: "red.png" },
		];
		return (
			<div style={{ width: 300, height: 300 }}>
				<MultiImage
					label="Without rotation"
					images={images}
					primary={"img-1"}
					uploadImage={redImage}
					captureImage={redImage}
					readOnly
					disableRotation
				/>
			</div>
		);
	},
	play: async ({ canvasElement, userEvent }) => {
		const previewImage = canvasElement.querySelector("img");
		if (!previewImage) throw new Error("preview img not found");
		await userEvent.click(previewImage);

		const dialog = within(await within(document.body).findByRole("dialog"));
		await expect(
			dialog.getByRole("button", { name: "Close" }),
		).toBeInTheDocument();
		await expect(
			dialog.queryByRole("button", { name: "Rotate left" }),
		).not.toBeInTheDocument();
		await expect(
			dialog.queryByRole("button", { name: "Rotate right" }),
		).not.toBeInTheDocument();
	},
};

const MULTI_IMAGE_DIALOG_MESSAGE = (
	<Alert severity={"error"}>The image could not be removed</Alert>
);

/**
 * dialogMessage is shown at the top of the edit dialog, where the modal dialog does not hide
 * it from assistive technology, and onDialogOpenChange reports the dialog opening and closing
 */
export const MultiImageDialogMessage: StoryObj<
	Pick<MultiImageProps, "onDialogOpenChange">
> = {
	name: "MultiImage — a message at the top of the edit dialog",
	args: { onDialogOpenChange: fn() },
	parameters: {
		a11y: {
			test: "error",
			config: {
				// every image is alt="" and named by its tooltip (ISSUE-3491-ITEM-27)
				rules: [{ id: "presentation-role-conflict", enabled: false }],
			},
		},
	},
	render: (args) => {
		const redImage = makeColorImage("#e53935", "#ffcdd2");
		const greenImage = makeColorImage("#43a047", "#c8e6c9");
		const images: MultiImageImage[] = [
			{ id: "img-1", image: redImage, name: "red.png" },
			{ id: "img-2", image: greenImage, name: "green.png" },
		];
		return (
			<div style={{ width: 300 }}>
				<MultiImage
					label="Product images"
					images={images}
					primary={"img-1"}
					uploadImage={redImage}
					captureImage={redImage}
					dialogMessage={MULTI_IMAGE_DIALOG_MESSAGE}
					onDialogOpenChange={args.onDialogOpenChange}
				/>
			</div>
		);
	},
	play: async ({ args, canvas, userEvent }) => {
		await expect(canvas.queryByRole("alert")).toBeNull();

		await userEvent.click(canvas.getByText("Edit"));
		const dialog = await within(document.body).findByRole("dialog");
		await expect(within(dialog).getByRole("alert")).toHaveTextContent(
			"The image could not be removed",
		);
		await expect(args.onDialogOpenChange).toHaveBeenLastCalledWith(true);

		await userEvent.click(
			within(dialog).getByRole("button", { name: "Close" }),
		);
		await expect(args.onDialogOpenChange).toHaveBeenLastCalledWith(false);
		await waitFor(() =>
			expect(within(document.body).queryByRole("dialog")).toBeNull(),
		);
	},
};

// ---------------------------------------------------------------------------
// FileIcons gallery
// ---------------------------------------------------------------------------

const fileIconRows: {
	label: string;
	component: React.ComponentType<SvgIconProps>;
}[] = [
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
		<Grid container spacing={2} sx={{ alignItems: "center" }}>
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
			<Grid container spacing={2} sx={{ alignItems: "center" }}>
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

/**
 * Per-file pending change: a file the user added is green, one they removed is struck
 * through and offers a restore in place of its remove button. Removal is deliberately
 * not coloured red — red reads as an error, and this is a pending change.
 */
export const FileChangeStates: StoryObj = {
	name: "FileUploadGeneric — added / removed files",
	render: () => {
		const server = (
			name: string,
			type: string,
			del = false,
		): FileData<FileMeta> => ({
			file: { name, type, downloadLink: "data:text/plain;base64,eA==" },
			canBeUploaded: false,
			delete: del,
		});
		const [files, setFiles] = useState<FileData[]>([
			server("contract.pdf", "application/pdf"),
			{
				file: new File(["x"], "addendum.docx", { type: "application/msword" }),
				canBeUploaded: true,
				delete: false,
			},
			server("budget.xlsx", "application/vnd.ms-excel", true),
		]);
		return (
			<div style={{ width: 480 }}>
				<FileUploadGeneric
					files={files}
					onChange={setFiles}
					label="Attachments"
					previewSize={24}
					variant="modern"
					handleError={() => {}}
				/>
			</div>
		);
	},
	play: async ({ canvas, canvasElement }) => {
		const label = (name: string) => canvas.getByText(name);
		await expect(
			getComputedStyle(label("contract.pdf")).textDecorationLine,
		).toBe("none");
		await expect(label("addendum.docx").dataset.ccChange).toBe("added");
		// success.main, not the default text colour
		await expect(getComputedStyle(label("addendum.docx")).color).not.toBe(
			getComputedStyle(label("contract.pdf")).color,
		);
		await expect(label("budget.xlsx").dataset.ccChange).toBe("removed");
		await expect(
			getComputedStyle(label("budget.xlsx")).textDecorationLine,
		).toBe("line-through");
		// the removed file offers a restore instead of a remove
		const restore = canvasElement.querySelector(
			'[data-testid="RestoreFromTrashIcon"]',
		);
		await expect(restore).not.toBe(null);
	},
};

/**
 * The dirty marker on the two controls that label themselves with a fieldset legend
 * rather than a MUI FormLabel, so the pseudo element the other controls use can't
 * reach them. They take the flag as a prop and render the marker as an element.
 */
export const DirtyMarkerOnGroupBoxLabels: StoryObj = {
	name: "Dirty marker — file upload and image selector",
	render: () => {
		const [files, setFiles] = useState<FileData[]>([]);
		const [value, setValue] = useState<string | Blob>("");
		return (
			<Grid container spacing={2} sx={{ width: 640 }}>
				<Grid size={6}>
					<FileUploadGeneric
						files={files}
						onChange={setFiles}
						label="Attachments"
						previewSize={64}
						dirty
						handleError={() => {}}
					/>
				</Grid>
				<Grid size={6}>
					<ImageSelector
						name="unmodified"
						value={value}
						capture={false}
						alt="Profile picture"
						readOnly={false}
						onChange={(_name, v) => setValue(v)}
						label="Profile picture"
					/>
				</Grid>
			</Grid>
		);
	},
	play: async ({ canvas }) => {
		const marker = canvas.getByText("Attachments").querySelector("span")!;
		await expect(marker).not.toBe(null);
		// a painted dot, not just an empty span
		await expect(getComputedStyle(marker).width).toBe("6px");
		await expect(getComputedStyle(marker).borderRadius).toBe("50%");
		await expect(
			canvas.getByText("Profile picture").querySelector("span"),
		).toBe(null);
	},
};

// ---------------------------------------------------------------------------
// FileUploadGeneric: keyboard, change states, theming and bug stories
// ---------------------------------------------------------------------------

/**
 * FileUploadGeneric holding its value in state, as a form does
 */
const ControlledUpload = (
	props: Partial<FileUploadProps> & { initial?: FileData[] },
) => {
	const { initial, onChange, ...rest } = props;
	const [files, setFiles] = useState<FileData[]>(initial ?? []);
	return (
		<FileUploadGeneric
			previewSize={rest.variant === "modern" ? 24 : 64}
			handleError={() => {}}
			{...rest}
			files={files}
			onChange={(next) => {
				setFiles(next);
				onChange?.(next);
			}}
		/>
	);
};

/**
 * Counts how often the hidden file input is clicked (the picker would open) and keeps
 * the picker closed
 * @returns The current count, and the cleanup
 */
const countPickerOpens = (canvasElement: HTMLElement) => {
	const input = canvasElement.querySelector('input[type="file"]');
	let clicks = 0;
	const count = (evt: Event) => {
		clicks++;
		evt.preventDefault();
	};
	input?.addEventListener("click", count);
	return {
		clicks: () => clicks,
		stop: () => input?.removeEventListener("click", count),
	};
};

export const Issue3489Item2ModernUploadIsKeyboardOperable: FUGStory = {
	args: { name: "docs", label: "Documents", variant: "modern" },
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3489-ITEM-2: the modern variant (SCF's default) has no tab stop. Tab from the button before it lands on the button after it, so a keyboard user cannot add a file. Expected: a focusable upload control inside the field that opens the picker on Enter and carries `name`.",
			},
		},
	},
	render: (args) => (
		<div style={{ width: 480 }}>
			<button type="button">before</button>
			<ControlledUpload {...args} />
			<button type="button">after</button>
		</div>
	),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const picker = countPickerOpens(canvasElement);
		try {
			canvas.getByRole("button", { name: "before" }).focus();
			await userEvent.tab();
			const active = document.activeElement;
			await expect(
				canvasElement.querySelector("fieldset")?.contains(active),
				`Tab moved focus to "${active?.textContent ?? ""}"`,
			).toBe(true);
			await expect(active).toHaveAttribute("name", "docs");
			await userEvent.keyboard("{Enter}");
			await expect(picker.clicks()).toBe(1);
		} finally {
			picker.stop();
		}
	},
};

/**
 * The modern upload button: Enter and Space open the file picker, a click on it opens it
 * once, keyboard focus shows an outline, and leaving it calls onBlur.
 */
export const Issue3489Item2ModernUploadButtonKeyboard: FUGStory = {
	name: "FileUploadGeneric — keyboard (modern)",
	args: { name: "docs", onBlur: fn(), label: "Documents", variant: "modern" },
	parameters: {
		a11y: {
			test: "error",
			// the modern texts' contrast is ISSUE-3489-ITEM-10, not what this story is about
			config: { rules: [{ id: "color-contrast", enabled: false }] },
		},
	},
	render: (args) => (
		<div style={{ width: 480 }}>
			<button type="button">before</button>
			<ControlledUpload {...args} />
			<button type="button">after</button>
		</div>
	),
	play: async ({ args, canvas, canvasElement, userEvent }) => {
		const picker = countPickerOpens(canvasElement);
		try {
			canvas.getByRole("button", { name: "before" }).focus();
			await userEvent.tab();
			const upload = canvas.getByRole("button", {
				name: "Drag & drop file here or click for an upload dialog",
			});
			await expect(upload).toHaveFocus();
			const cs = getComputedStyle(upload);
			await expect(
				cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2,
				`outline ${cs.outlineStyle} ${cs.outlineWidth}`,
			).toBe(true);
			await userEvent.keyboard("{Enter}");
			await expect(picker.clicks()).toBe(1);
			await userEvent.keyboard(" ");
			await expect(picker.clicks()).toBe(2);
			await userEvent.click(upload);
			await expect(picker.clicks()).toBe(3);
			await userEvent.tab();
			await expect(canvas.getByRole("button", { name: "after" })).toHaveFocus();
			await expect(args.onBlur).toHaveBeenCalledTimes(1);
		} finally {
			picker.stop();
		}
	},
};
