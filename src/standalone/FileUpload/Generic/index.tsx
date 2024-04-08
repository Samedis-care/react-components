import React, {
	ForwardedRef,
	RefAttributes,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import {
	Box,
	Button,
	FormHelperText,
	styled,
	Tooltip,
	Typography,
	Unstable_Grid2 as Grid,
	useThemeProps,
} from "@mui/material";
import { AttachFile } from "@mui/icons-material";
import FilePreview, { getFileIconOrDefault } from "./File";
import { FileSelectorError } from "./Errors";
import processImage, { IDownscaleProps } from "../../../utils/processImage";
import GroupBox from "../../GroupBox";
import useCCTranslations from "../../../utils/useCCTranslations";
import isTouchDevice from "../../../utils/isTouchDevice";
import combineClassNames from "../../../utils/combineClassNames";
import getFileExt from "../../../utils/getFileExt";
import matchMime from "../../../utils/matchMime";
import useDropZone from "../../../utils/useDropZone";

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

export interface FileUploadRendererProps
	extends Omit<
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
}

export interface FileMeta {
	/**
	 * The file name
	 */
	name: string;
	/**
	 * The download link for the file
	 */
	downloadLink?: string;
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
	 */
	preview?: string;
	/**
	 * Set to true if the file should be deleted from the server, only true if canBeUploaded is false
	 */
	delete?: boolean;
}

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

const FileInput = styled("input", {
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
		handleError,
		accept,
		acceptLabel,
		onChange,
		label,
		smallLabel,
		readOnly,
		onBlur,
		uploadLabel,
		allowDuplicates,
		className,
		classes,
	} = props;
	const variant = props.variant ?? "classic";
	const loadInitialFiles = () =>
		(props.files || props.defaultFiles || []).map((meta) => ({
			canBeUploaded: false,
			delete: false,
			...meta,
		}));
	const [files, setFiles] = useState<FileData[]>(loadInitialFiles);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const { t } = useCCTranslations();

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
					newFiles.push({
						file,
						preview: await processImage(
							file,
							convertImagesTo,
							imageDownscaleOptions,
						),
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

			setFiles((prev) => {
				const newValue: FileData[] = allowDuplicates
					? [...prev, ...newFiles]
					: [
							...prev.filter(
								// check for file name duplicates and replace
								(file) =>
									!newFiles
										.map((newFile) => newFile.file.name)
										.includes(file.file.name),
							),
							...newFiles,
						];
				if (onChange) onChange(newValue);
				return newValue;
			});
		},
		[
			accept,
			allowDuplicates,
			convertImagesTo,
			getRemainingFileCount,
			handleError,
			imageDownscaleOptions,
			maxFiles,
			onChange,
			previewImages,
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
			if ("downloadLink" in file.file) {
				file.delete = true;
				setFiles((prev) => {
					const newValue = [...prev];
					if (onChange) onChange(newValue);
					return newValue;
				});
				return;
			}

			setFiles((prev) => {
				const newValue = prev.filter((f) => f !== file);
				if (onChange) onChange(newValue);
				return newValue;
			});
		},
		[onChange],
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
		});
	} else if (variant === "classic") {
		return (
			<StyledGroupBox
				label={label}
				smallLabel={smallLabel}
				className={combineClassNames([className, classes?.root])}
			>
				<Dropzone
					container
					spacing={2}
					alignContent={"space-between"}
					onDragOver={handleDragOver}
					onDrop={handleDrop}
					className={combineClassNames([
						"components-care-dropzone",
						classes?.dropzone,
						dragging && "Mui-active",
					])}
				>
					{!readOnly && (
						<Grid xs key={"upload"}>
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
					<Grid xs={12} key={"files"}>
						<Grid
							container
							spacing={2}
							alignContent={"flex-start"}
							alignItems={"flex-start"}
						>
							{files.map(
								(data: FileData, index) =>
									data && (
										<FilePreview
											name={data.file.name}
											downloadLink={
												"downloadLink" in data.file
													? data.file.downloadLink
													: undefined
											}
											key={`${index}-${data.file.name}`}
											size={previewSize}
											preview={previewImages ? data.preview : undefined}
											disabled={data.delete || false}
											onRemove={
												readOnly || data.preventDelete
													? undefined
													: () => removeFile(data)
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
						<Grid xs={12} key={"info"}>
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
				label={label}
				smallLabel={smallLabel}
				className={combineClassNames([className, classes?.root])}
			>
				<Grid
					container
					spacing={2}
					alignContent={"space-between"}
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
						<Grid xs key={"upload"}>
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
						<Grid xs={12} key={"files"}>
							<Box mx={1}>
								<Grid
									container
									spacing={1}
									alignContent={"flex-start"}
									alignItems={"flex-start"}
								>
									{files.map(
										(data: FileData, index) =>
											data && (
												<FilePreview
													name={data.file.name}
													downloadLink={
														"downloadLink" in data.file
															? data.file.downloadLink
															: undefined
													}
													key={`${index}-${data.file.name}`}
													size={previewSize}
													preview={previewImages ? data.preview : undefined}
													disabled={data.delete || false}
													onRemove={
														readOnly || data.preventDelete
															? undefined
															: () => removeFile(data)
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
						<Grid xs={12} key={"no-files"}>
							<Typography>{t("standalone.file-upload.no-files")}</Typography>
						</Grid>
					)}
					{!readOnly && (
						<Grid xs={12} key={"info"} container wrap={"nowrap"} spacing={1}>
							<Grid xs>
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
											{React.createElement(getFileIconOrDefault(entry))}
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
