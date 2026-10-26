import React, {
	ForwardedRef,
	RefAttributes,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
} from "react";
import {
	Box,
	Button,
	FormHelperText,
	styled,
	Tooltip,
	Typography,
	Grid,
	useThemeProps,
} from "@mui/material";
import { AttachFile } from "@mui/icons-material";
import FilePreview, { FileChangeState, getFileIconOrDefault } from "./File";
import { FileSelectorError } from "./Errors";
import processImage, { IDownscaleProps } from "../../../utils/processImage";
import GroupBox from "../../GroupBox";
import { labelWithDirtyMarker } from "../../UIKit/MuiFieldState";
import useCCTranslations from "../../../utils/useCCTranslations";
import isTouchDevice from "../../../utils/isTouchDevice";
import combineClassNames from "../../../utils/combineClassNames";
import getFileExt from "../../../utils/getFileExt";
import formatFileSize from "../../../utils/formatFileSize";
import useCurrentLocale from "../../../utils/useCurrentLocale";
import matchMime from "../../../utils/matchMime";
import useDropZone from "../../../utils/useDropZone";
import useRefState from "../../../utils/useRefState";
import { isImageLoadError } from "../../../utils/ImageLoadError";
import { captureError } from "../../../framework/ErrorReporting";

export interface FileUploadProps {
	/**
	 * The HTML name attribute on the upload button
	 */
	name?: string;
	/**
	 * Maximum amount of files allowed
	 */
	maxFiles?: number;
	/**
	 * Smallest size a picked file may have, in bytes
	 * @remarks Checked against what is uploaded: the processed image where the control
	 *          makes one (`FileData.preview`, see `convertImagesTo`,
	 *          `imageDownscaleOptions` and `previewImages`), otherwise the file. A
	 *          selection with a smaller file is refused as a whole
	 *          (`files.size.too-small`). Unset means no minimum.
	 */
	minFileSize?: number;
	/**
	 * Largest size a picked file may have, in bytes
	 * @remarks Checked like `minFileSize`, so a photo counts at its processed size. A
	 *          selection with a larger file is refused as a whole
	 *          (`files.size.too-large`). Unset means no maximum.
	 */
	maxFileSize?: number;
	/**
	 * Largest size all listed files may have together, in bytes
	 * @remarks Counts every listed file that is not removed: a picked one at its upload
	 *          size (see `minFileSize`), any other at its `FileMeta.size`, which counts as
	 *          0 bytes where it is unset. A selection that would go over the limit is
	 *          refused as a whole (`files.selector.too-large`). Unset means no maximum.
	 */
	maxTotalFileSize?: number;
	/**
	 * Filter for allowed mime types and file extensions (see <input accept="VALUE">)
	 */
	accept?: string;
	/**
	 * Custom label for accepted file formats ("File formats:" prefix is prepended)
	 */
	acceptLabel?: string;
	/**
	 * Optional resolution restrictions for images
	 */
	imageDownscaleOptions?: IDownscaleProps;
	/**
	 * Optional mime type to convert images to
	 */
	convertImagesTo?: string;
	/**
	 * Properties for preview
	 */
	previewSize: number;
	/**
	 * The label type of the box
	 */
	smallLabel?: boolean;
	/**
	 * Should we show images instead of file icons?
	 */
	previewImages?: boolean;
	/**
	 * Should file duplicates be allowed? If not files with the same file name will be replaced
	 * @remarks The replaced file is removed as the remove button removes it: one that exists
	 *          on the server stays listed with `delete` set. A file with `preventDelete` is
	 *          not replaced, and the new one is listed next to it.
	 */
	allowDuplicates?: boolean;
	/**
	 * Called if an error occurred. Should provide feedback to the user
	 * @param err The error that occurred
	 * @param message A localized, human readable message
	 */
	handleError: (err: FileSelectorError, message: string) => void;
	/**
	 * Currently displayed files (for controlled input. for uncontrolled use defaultFiles)
	 */
	files?: FileData<FileMeta>[];
	/**
	 * Already selected files (for loading existing data)
	 */
	defaultFiles?: FileData<FileMeta>[];
	/**
	 * Called on file selection update
	 * @param files The newly selected files
	 */
	onChange?: (files: FileData[]) => void;
	/**
	 * Called instead of the built-in restore when a pending removal is undone
	 * @remarks The built-in restore just clears the `delete` flag, which is all that is
	 *          needed while the removal is only a flag on the file. Where it has already
	 *          been handed to a connector queue, only the owner of that queue can undo
	 *          it, so that owner takes the callback.
	 */
	onRestoreFile?: (file: FileData) => void;
	/**
	 * onBlur event handler
	 */
	onBlur?: React.FocusEventHandler<HTMLElement>;
	/**
	 * Custom label for the upload files button
	 */
	uploadLabel?: string;
	/**
	 * Makes the file upload control read only
	 */
	readOnly?: boolean;
	/**
	 * The label of the component
	 */
	label?: string;
	/**
	 * Does the value differ from the server-side value?
	 * @remarks Marks the label. Set by the form engine from `RenderParams.dirty`.
	 */
	dirty?: boolean;
	/**
	 * CSS class to apply to root
	 */
	className?: string;
	/**
	 * Custom CSS classes for styling
	 */
	classes?: Partial<Record<FileUploadClassKey, string>>;
	/**
	 * Variant (design) to use
	 * @default classic
	 * @remarks When using 'modern' preview size should be set to 24
	 */
	variant?: "classic" | "modern" | React.ComponentType<FileUploadRendererProps>;
}

export interface FileUploadRendererProps extends Omit<
	FileUploadProps,
	"variant" | "onChange" | "defaultFiles" | "files"
> {
	/**
	 * Drag over event handler for drop zone
	 */
	handleDragOver: React.DragEventHandler;
	/**
	 * Drop handler for drop zone
	 */
	handleDrop: React.DragEventHandler;
	/**
	 * Dragging flag to display "drop here" styles
	 */
	dragging: boolean;
	/**
	 * Open the upload dialog
	 */
	handleUpload: (capture?: FileCaptureConfig) => void;
	/**
	 * Get remaining uploadable file count (maxFiles - currentFiles).
	 * @remarks Only call when maxFiles is specified!
	 */
	getRemainingFileCount: () => number;
	/**
	 * onChange handler for file input
	 */
	handleFileChange: React.ChangeEventHandler<HTMLInputElement>;
	/**
	 * ref for file input
	 */
	inputRef: React.MutableRefObject<HTMLInputElement | null>;
	/**
	 * The current files
	 */
	files: FileData[];
	/**
	 * Remove a file
	 * @param file The file to remove
	 */
	removeFile: (file: FileData) => void;
	/**
	 * Undo a pending removal
	 * @param file The file to restore
	 */
	restoreFile: (file: FileData) => void;
}

export interface FileMeta {
	/**
	 * The file name
	 */
	name: string;
	/**
	 * The file mime type
	 */
	type: string;
	/**
	 * The download link for the file
	 * @remarks A URL, or the file itself while it is only held locally (e.g. a file whose
	 *          upload is queued)
	 */
	downloadLink?: string | Blob;
	/**
	 * The file size in bytes, if known
	 * @remarks Counts towards `FileUploadProps.maxTotalFileSize`, where a file without it
	 *          counts as 0 bytes
	 */
	size?: number;
}

export interface FileData<T = File | FileMeta> {
	/**
	 * The file from the file upload
	 */
	file: T;
	/**
	 * Prevent the file from getting deleted
	 */
	preventDelete?: boolean;
	/**
	 * The file can be uploaded? (has it been selected by the user?)
	 * If canBeUploaded is true T is File, otherwise T is FileMeta
	 */
	canBeUploaded?: boolean;
	/**
	 * The processed image, if present: should be uploaded instead of file.
	 * @remarks A URL for a file from the server, a Blob for an image the user picked
	 */
	preview?: string | Blob;
	/**
	 * Set to true if the file should be deleted from the server, only true if canBeUploaded is false
	 */
	delete?: boolean;
	/**
	 * The file's pending change relative to the server, for display
	 * @remarks Leave it unset and the control derives the state from the flags above,
	 *          which is all a plain FileUpload needs: a picked file has `canBeUploaded`,
	 *          a file marked for removal has `delete`.
	 *
	 *          It exists for CrudFileUpload, where handing a write to the connector
	 *          destroys both of those signals on purpose: the picked File is replaced by
	 *          the `deserialize`d backend representation, so it is no longer a Blob and
	 *          must not keep `canBeUploaded` or it would upload twice; and `delete` is
	 *          cleared once the removal is queued, or the next change would queue it
	 *          again. With a LazyConnector the write is only queued, so a pending change
	 *          then looks exactly like a file that was always on the server.
	 */
	changeState?: FileChangeState;
}

/**
 * The file's pending change relative to the server side state
 * @param file The file
 * @remarks An explicit changeState wins: only whoever queued the operation can know it.
 *          Otherwise it follows from the flags the control maintains itself — a file the
 *          user picked is not on the server yet, a marked one is still on it.
 */
const getChangeState = (file: FileData): FileChangeState | undefined =>
	file.changeState ??
	(file.delete ? "removed" : file.canBeUploaded ? "added" : undefined);

/**
 * Removes files from the list as the user's remove does
 * @param files The list
 * @param isRemoved Selects the files to remove
 * @remarks A file that exists on the server is only marked, so that the removal can be
 *          undone and so that the submit knows to delete it. A file the user just picked
 *          has nothing to delete server side, so it goes.
 */
const removeFiles = (
	files: FileData[],
	isRemoved: (file: FileData) => boolean,
): FileData[] =>
	files.flatMap((file) =>
		!isRemoved(file)
			? [file]
			: "downloadLink" in file.file
				? [{ ...file, delete: true }]
				: [],
	);

/**
 * The size of what a file uploads, in bytes
 * @param file The file
 * @remarks A picked file uploads its processed image if the control made one. Any other
 *          file has the size it was listed with, if it was listed with one.
 */
const getUploadSize = (file: FileData): number =>
	file.file instanceof Blob
		? (file.preview instanceof Blob ? file.preview : file.file).size
		: (file.file.size ?? 0);

/**
 * The size of all files that are not removed, in bytes
 * @param files The list
 */
const getTotalSize = (files: FileData[]): number =>
	files.reduce(
		(total, file) => (file.delete ? total : total + getUploadSize(file)),
		0,
	);

export interface FileUploadDispatch {
	/**
	 * Add the given file as if the user selected it
	 * @param file The file
	 */
	addFile: (file: File) => Promise<void>;
	/**
	 * Open the upload dialog
	 */
	openUploadDialog: (capture?: FileCaptureConfig) => void;
}

export interface FileCaptureConfig {
	type: "image" | "audio" | "video";
	source: "user" | "environment";
}

const StyledGroupBox = styled(GroupBox, { name: "CcFileUpload", slot: "root" })(
	{},
);
const Dropzone = styled(Grid, { name: "CcFileUpload", slot: "dropzone" })(
	({ theme }) => ({
		"&.Mui-active": {
			border: `2px solid ${theme.palette.primary.main}`,
		},
	}),
);

const FormatTextModern = styled(Typography, {
	name: "CcFileUpload",
	slot: "formatTextModern",
})(({ theme }) => ({
	color: theme.palette.action.disabled,
}));

const FormatIconsModern = styled(Grid, {
	name: "CcFileUpload",
	slot: "formatIconsModern",
})(({ theme }) => ({
	color: theme.palette.action.disabled,
}));

export const FileInput: React.ComponentType<
	React.InputHTMLAttributes<HTMLInputElement> &
		React.RefAttributes<HTMLInputElement>
> = styled("input", {
	name: "CcFileUpload",
	slot: "fileInput",
})({
	display: "none",
});

const FormatText = styled(FormHelperText, {
	name: "CcFileUpload",
	slot: "formatText",
})({
	textAlign: "right",
});

const ModernUploadLabel = styled("span", {
	name: "CcFileUpload",
	slot: "modernUploadLabel",
})(({ theme }) => ({
	textAlign: "center",
	color: theme.palette.action.disabled,
	display: "block",
	width: "100%",
	"&.CcFileUpload-modernUploadLabel-empty": theme.typography.h5,
}));

export type FileUploadClassKey =
	| "root"
	| "dropzone"
	| "formatTextModern"
	| "formatIconsModern"
	| "fileInput"
	| "formatText"
	| "modernUploadLabel";

const FileUpload = (
	inProps: FileUploadProps & RefAttributes<FileUploadDispatch>,
	ref: ForwardedRef<FileUploadDispatch>,
): React.ReactElement => {
	const props = useThemeProps({ props: inProps, name: "CcFileUpload" });
	const {
		name,
		convertImagesTo,
		imageDownscaleOptions,
		previewImages,
		previewSize,
		maxFiles,
		minFileSize,
		maxFileSize,
		maxTotalFileSize,
		handleError,
		accept,
		acceptLabel,
		onChange,
		onRestoreFile,
		label,
		dirty,
		smallLabel,
		readOnly,
		onBlur,
		uploadLabel,
		allowDuplicates,
		className,
		classes,
	} = props;
	const variant = props.variant ?? "classic";
	const boxLabel = labelWithDirtyMarker(label, dirty);
	const loadInitialFiles = () =>
		(props.files || props.defaultFiles || []).map((meta) => ({
			canBeUploaded: false,
			delete: false,
			...meta,
		}));
	const {
		state: files,
		get: getFiles,
		set: setFiles,
	} = useRefState<FileData[]>(loadInitialFiles);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const { t } = useCCTranslations();
	const locale = useCurrentLocale();

	const getRemainingFileCount = useCallback(() => {
		if (!maxFiles)
			throw new Error("max files isn't set, this function shouldn't be called");

		return maxFiles - files.filter((file) => !file.delete).length;
	}, [maxFiles, files]);

	const processFiles = useCallback(
		async (files: FileList | File[]) => {
			const processImages = !!(
				convertImagesTo ||
				imageDownscaleOptions ||
				previewImages
			);

			if (maxFiles) {
				if (files.length > getRemainingFileCount()) {
					handleError(
						"files.selector.too-many",
						t("standalone.file-upload.error.too-many"),
					);
					return;
				}
			}

			const newFiles: FileData<File>[] = [];
			for (let i = 0; i < files.length; i++) {
				let file = files[i];

				// fix for mobile safari image capture. name is always image.jpg
				if (!allowDuplicates && isTouchDevice() && file.name === "image.jpg") {
					file = new File(
						[file],
						`image-${new Date()
							.toISOString()
							.replace(/[:.T]/g, "-")
							.replace(/Z/g, "")}.jpg`,
						{
							type: file.type,
							lastModified: file.lastModified,
						},
					);
				}

				const isImage = file.type.startsWith("image/");
				if (isImage && processImages) {
					let preview: File;
					try {
						preview = await processImage(
							file,
							convertImagesTo,
							imageDownscaleOptions,
						);
					} catch (e) {
						// the image couldn't be read or the browser couldn't decode it (HEIC, TIFF, corrupt
						// file). abort the whole selection, a partial upload would be confusing.
						const err = e instanceof Error ? e : new Error(String(e));
						captureError(err, { source: "FileUpload.processFiles" });
						const loadFailed = isImageLoadError(err);
						handleError(
							loadFailed
								? "files.image.load-failed"
								: "files.image.process-failed",
							t(
								loadFailed
									? "standalone.file-upload.error.image-load-failed"
									: "standalone.file-upload.error.image-process-failed",
							),
						);
						return;
					}
					newFiles.push({
						file,
						preview,
						canBeUploaded: true,
						delete: false,
					});
				} else {
					newFiles.push({ file, canBeUploaded: true, delete: false });
				}
			}

			if (accept) {
				const allowedTypes = accept.split(",").map((type) => type.trim());
				const allowedFileExt = allowedTypes
					.filter((type) => type.startsWith("."))
					.map((type) => type.substring(1).toLowerCase());
				const allowedMimes = allowedTypes.filter((type) => type.includes("/"));

				if (
					newFiles.find(
						(file) =>
							!allowedMimes
								.map((allowed) => matchMime(allowed, file.file.type))
								.includes(true) &&
							!allowedFileExt.includes(
								getFileExt(file.file.name).toLowerCase(),
							),
					)
				) {
					handleError(
						"files.type.invalid",
						t("standalone.file-upload.error.invalid-type"),
					);
					return;
				}
			}

			if (minFileSize !== undefined) {
				const tooSmall = newFiles.find(
					(file) => getUploadSize(file) < minFileSize,
				);
				if (tooSmall) {
					handleError(
						"files.size.too-small",
						t("standalone.file-upload.error.too-small", {
							NAME: tooSmall.file.name,
							SIZE: formatFileSize(minFileSize, locale),
						}),
					);
					return;
				}
			}
			if (maxFileSize !== undefined) {
				const tooLarge = newFiles.find(
					(file) => getUploadSize(file) > maxFileSize,
				);
				if (tooLarge) {
					handleError(
						"files.size.too-large",
						t("standalone.file-upload.error.too-large", {
							NAME: tooLarge.file.name,
							SIZE: formatFileSize(maxFileSize, locale),
						}),
					);
					return;
				}
			}

			const newNames = new Set(newFiles.map((newFile) => newFile.file.name));
			const addNewFiles = (prev: FileData[]): FileData[] => [
				...(allowDuplicates
					? prev
					: // a file of the same name is replaced, which is a removal like any
						// other: one on the server stays listed for the submit to delete. One
						// that cannot be removed is not replaced.
						removeFiles(
							prev,
							(file) => !file.preventDelete && newNames.has(file.file.name),
						)),
				...newFiles,
			];

			// on the list as it would be, so a file that replaces another counts once
			if (
				maxTotalFileSize !== undefined &&
				getTotalSize(addNewFiles(getFiles())) > maxTotalFileSize
			) {
				handleError(
					"files.selector.too-large",
					t("standalone.file-upload.error.total-too-large", {
						SIZE: formatFileSize(maxTotalFileSize, locale),
					}),
				);
				return;
			}

			setFiles((prev) => {
				const newValue = addNewFiles(prev);
				if (onChange) onChange(newValue);
				return newValue;
			});
		},
		[
			accept,
			allowDuplicates,
			convertImagesTo,
			getFiles,
			getRemainingFileCount,
			handleError,
			imageDownscaleOptions,
			locale,
			maxFileSize,
			maxFiles,
			maxTotalFileSize,
			minFileSize,
			onChange,
			previewImages,
			setFiles,
			t,
		],
	);
	const handleUpload = useCallback(
		(capture?: FileCaptureConfig) => {
			const elem = inputRef.current;

			if (!elem) return;

			const prevAccept = elem.accept;
			const prevCapture = elem.capture;
			if (capture) {
				elem.accept = capture.type + "/*";
				elem.capture = capture.source;
			}

			if (maxFiles) {
				if (getRemainingFileCount() === 0) {
					handleError(
						"files.selector.limit-reached",
						t("standalone.file-upload.error.limit-reached"),
					);
					return;
				}
			}

			elem.click();

			if (capture) {
				if (prevCapture) elem.capture = prevCapture;
				else elem.removeAttribute("capture");
				if (prevAccept) elem.accept = prevAccept;
				else elem.removeAttribute("accept");
			}
		},
		[maxFiles, getRemainingFileCount, handleError, t],
	);

	const handleFileChange = useCallback(
		async (evt: React.ChangeEvent<HTMLInputElement>) => {
			const files = evt.currentTarget.files;
			if (!files) return;
			return processFiles(files);
		},
		[processFiles],
	);

	const removeFile = useCallback(
		(file: FileData) => {
			setFiles((prev) => {
				const newValue = removeFiles(prev, (f) => f === file);
				if (onChange) onChange(newValue);
				return newValue;
			});
		},
		[onChange, setFiles],
	);

	const restoreFile = useCallback(
		(file: FileData) => {
			if (onRestoreFile) {
				onRestoreFile(file);
				return;
			}
			setFiles((prev) => {
				const newValue = prev.map((f) =>
					f === file ? { ...f, delete: false } : f,
				);
				if (onChange) onChange(newValue);
				return newValue;
			});
		},
		[onChange, onRestoreFile, setFiles],
	);
	const { handleDrop, handleDragOver, dragging } = useDropZone(
		readOnly ? undefined : processFiles,
	);

	// update files if necessary
	useEffect(() => {
		setFiles(loadInitialFiles);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.files]);

	useImperativeHandle<FileUploadDispatch, FileUploadDispatch>(ref, () => ({
		addFile: (file) => {
			return processFiles([file]);
		},
		openUploadDialog: handleUpload,
	}));

	if (typeof variant !== "string") {
		return React.createElement(variant, {
			...props,
			handleDragOver,
			handleDrop,
			dragging,
			handleUpload,
			getRemainingFileCount,
			// eslint-disable-next-line @typescript-eslint/no-misused-promises
			handleFileChange,
			inputRef,
			files,
			removeFile,
			restoreFile,
		});
	} else if (variant === "classic") {
		return (
			<StyledGroupBox
				label={boxLabel}
				smallLabel={smallLabel}
				className={combineClassNames([className, classes?.root])}
			>
				<Dropzone
					container
					spacing={2}
					sx={{ alignContent: "space-between" }}
					onDragOver={handleDragOver}
					onDrop={handleDrop}
					className={combineClassNames([
						"components-care-dropzone",
						classes?.dropzone,
						dragging && "Mui-active",
					])}
				>
					{!readOnly && (
						<Grid key={"upload"} size="grow">
							<Button
								startIcon={<AttachFile />}
								variant={"contained"}
								color={"primary"}
								onClick={() => handleUpload()}
								name={name}
								onBlur={onBlur}
							>
								{uploadLabel || t("standalone.file-upload.upload")}
							</Button>
							<FileInput
								type={"file"}
								accept={accept || undefined}
								multiple={maxFiles ? getRemainingFileCount() > 1 : true}
								onChange={handleFileChange}
								className={classes?.fileInput}
								ref={inputRef}
							/>
						</Grid>
					)}
					<Grid key={"files"} size={12}>
						<Grid
							container
							spacing={2}
							sx={{ alignContent: "flex-start", alignItems: "flex-start" }}
						>
							{files.map(
								(data: FileData, index) =>
									data && (
										<FilePreview
											name={data.file.name}
											mimeType={data.file.type}
											downloadLink={
												"downloadLink" in data.file
													? data.file.downloadLink
													: undefined
											}
											key={`${index}-${data.file.name}`}
											size={previewSize}
											preview={previewImages ? data.preview : undefined}
											disabled={data.delete || false}
											changeState={getChangeState(data)}
											restoreLabel={t("standalone.file-upload.restore")}
											onRemove={
												readOnly || data.preventDelete
													? undefined
													: () => removeFile(data)
											}
											onRestore={
												readOnly || data.preventDelete
													? undefined
													: () => restoreFile(data)
											}
											variant={"box"}
										/>
									),
							)}
							{readOnly && files.length === 0 && (
								<Grid>
									<Typography>
										{t("standalone.file-upload.no-files")}
									</Typography>
								</Grid>
							)}
						</Grid>
					</Grid>
					{!readOnly && (
						<Grid key={"info"} size={12}>
							<FormatText className={classes?.formatText}>
								({t("standalone.file-upload.formats")}:{" "}
								{acceptLabel ||
									accept ||
									t("standalone.file-upload.format.any")}
								)
							</FormatText>
						</Grid>
					)}
				</Dropzone>
			</StyledGroupBox>
		);
	} else if (variant === "modern") {
		const acceptFiles = accept ? accept.split(",") : [];
		return (
			<StyledGroupBox
				label={boxLabel}
				smallLabel={smallLabel}
				className={combineClassNames([className, classes?.root])}
			>
				<Grid
					container
					spacing={2}
					sx={{ alignContent: "space-between" }}
					onDragOver={handleDragOver}
					onDrop={handleDrop}
					onClick={() => handleUpload()}
					className={combineClassNames([
						classes?.dropzone,
						"components-care-dropzone",
						dragging && "Mui-active",
					])}
				>
					{!readOnly && (
						<Grid key={"upload"} size="grow">
							<ModernUploadLabel
								className={combineClassNames([
									classes?.modernUploadLabel,
									files.length === 0 && "CcFileUpload-modernUploadLabel-empty",
								])}
							>
								{uploadLabel || t("standalone.file-upload.upload-modern")}
							</ModernUploadLabel>
							<FileInput
								type={"file"}
								accept={accept || undefined}
								multiple={maxFiles ? getRemainingFileCount() > 1 : true}
								onChange={handleFileChange}
								className={classes?.fileInput}
								ref={inputRef}
							/>
						</Grid>
					)}
					{files.length > 0 && (
						<Grid key={"files"} size={12}>
							<Box sx={{ mx: 1 }}>
								<Grid
									container
									spacing={1}
									sx={{ alignContent: "flex-start", alignItems: "flex-start" }}
								>
									{files.map(
										(data: FileData, index) =>
											data && (
												<FilePreview
													name={data.file.name}
													mimeType={data.file.type}
													downloadLink={
														"downloadLink" in data.file
															? data.file.downloadLink
															: undefined
													}
													key={`${index}-${data.file.name}`}
													size={previewSize}
													preview={previewImages ? data.preview : undefined}
													disabled={data.delete || false}
													changeState={getChangeState(data)}
													restoreLabel={t("standalone.file-upload.restore")}
													onRemove={
														readOnly || data.preventDelete
															? undefined
															: () => removeFile(data)
													}
													onRestore={
														readOnly || data.preventDelete
															? undefined
															: () => restoreFile(data)
													}
													variant={"list"}
												/>
											),
									)}
								</Grid>
							</Box>
						</Grid>
					)}
					{readOnly && files.length === 0 && (
						<Grid key={"no-files"} size={12}>
							<Typography>{t("standalone.file-upload.no-files")}</Typography>
						</Grid>
					)}
					{!readOnly && (
						<Grid key={"info"} container wrap={"nowrap"} spacing={1} size={12}>
							<Grid size="grow">
								<FormatTextModern
									align={"right"}
									className={classes?.formatTextModern}
								>
									{t("standalone.file-upload.formats-modern")}{" "}
									{acceptFiles.length == 0 &&
										t("standalone.file-upload.format.any")}
								</FormatTextModern>
							</Grid>
							{acceptFiles.map((entry, idx) => (
								<FormatIconsModern
									className={classes?.formatIconsModern}
									key={idx.toString(16)}
								>
									<Tooltip title={acceptLabel || accept || ""}>
										<span>
											{React.createElement(getFileIconOrDefault(entry, entry))}
										</span>
									</Tooltip>
								</FormatIconsModern>
							))}
						</Grid>
					)}
				</Grid>
			</StyledGroupBox>
		);
	} else {
		throw new Error("Invalid variant prop passed");
	}
};

export default React.forwardRef(FileUpload);
