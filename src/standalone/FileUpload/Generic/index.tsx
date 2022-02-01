import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	Button,
	FormHelperText,
	Grid,
	Theme,
	Typography,
} from "@material-ui/core";
import { AttachFile } from "@material-ui/icons";
import FilePreview from "./File";
import { FileSelectorError } from "./Errors";
import {
	combineClassNames,
	getFileExt,
	matchMime,
	processImage,
	useDropZone,
} from "../../../utils";
import { IDownscaleProps } from "../../../utils/processImage";
import GroupBox from "../../GroupBox";
import { makeStyles } from "@material-ui/core/styles";
import { ClassNameMap } from "@material-ui/styles/withStyles";
import useCCTranslations from "../../../utils/useCCTranslations";

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
	 * Custom CSS classes for styling
	 */
	classes?: ClassNameMap<keyof ReturnType<typeof useStyles>>;
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

const useStyles = makeStyles(
	(theme: Theme) => ({
		dropzone: {
			border: `2px solid ${theme.palette.primary.main}`,
		},
		formatText: {
			textAlign: "right",
		},
		fileInput: {
			display: "none",
		},
	}),
	{ name: "CcFileUpload" }
);

const FileUpload = (props: FileUploadProps): React.ReactElement => {
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
	} = props;
	const classes = useStyles(props);
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
		async (files: FileList) => {
			const processImages = !!(
				convertImagesTo ||
				imageDownscaleOptions ||
				previewImages
			);

			if (maxFiles) {
				if (files.length > getRemainingFileCount()) {
					handleError(
						"files.selector.too-many",
						t("standalone.file-upload.error.too-many")
					);
					return;
				}
			}

			const newFiles: FileData<File>[] = [];
			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				const isImage = file.type.startsWith("image/");
				if (isImage && processImages) {
					newFiles.push({
						file,
						preview: await processImage(
							file,
							convertImagesTo,
							imageDownscaleOptions
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
					.map((type) => type.substring(1));
				const allowedMimes = allowedTypes.filter((type) => type.includes("/"));

				if (
					newFiles.find(
						(file) =>
							!allowedMimes
								.map((allowed) => matchMime(allowed, file.file.type))
								.includes(true) &&
							!allowedFileExt.includes(getFileExt(file.file.name))
					)
				) {
					handleError(
						"files.type.invalid",
						t("standalone.file-upload.error.invalid-type")
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
										.includes(file.file.name)
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
		]
	);
	const handleUpload = useCallback(() => {
		const elem = inputRef.current;

		if (!elem) return;

		if (maxFiles) {
			if (getRemainingFileCount() === 0) {
				handleError(
					"files.selector.limit-reached",
					t("standalone.file-upload.error.limit-reached")
				);
				return;
			}
		}

		elem.click();
	}, [maxFiles, getRemainingFileCount, handleError, t]);

	const handleFileChange = useCallback(
		async (evt: React.ChangeEvent<HTMLInputElement>) => {
			const files = evt.currentTarget.files;
			if (!files) return;
			return processFiles(files);
		},
		[processFiles]
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
		[onChange]
	);
	const { handleDrop, handleDragOver, dragging } = useDropZone(
		readOnly ? undefined : processFiles
	);

	// update files if necessary
	useEffect(() => {
		setFiles(loadInitialFiles);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.files]);

	return (
		<GroupBox label={label} smallLabel={smallLabel}>
			<Grid
				container
				spacing={2}
				alignContent={"space-between"}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
				className={combineClassNames([
					"components-care-dropzone",
					dragging && classes.dropzone,
				])}
			>
				{!readOnly && (
					<Grid item xs key={"upload"}>
						<Button
							startIcon={<AttachFile />}
							variant={"contained"}
							color={"primary"}
							onClick={handleUpload}
							name={name}
							onBlur={onBlur}
						>
							{uploadLabel || t("standalone.file-upload.upload")}
						</Button>
						<input
							type={"file"}
							accept={accept || undefined}
							multiple={maxFiles ? getRemainingFileCount() > 1 : true}
							onChange={handleFileChange}
							className={classes.fileInput}
							ref={inputRef}
						/>
					</Grid>
				)}
				<Grid item xs={12} key={"files"}>
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
									/>
								)
						)}
						{readOnly && files.length === 0 && (
							<Grid item>
								<Typography>{t("standalone.file-upload.no-files")}</Typography>
							</Grid>
						)}
					</Grid>
				</Grid>
				{!readOnly && (
					<Grid item xs={12} key={"info"}>
						<FormHelperText className={classes.formatText}>
							({t("standalone.file-upload.formats")}:{" "}
							{acceptLabel || accept || t("standalone.file-upload.format.any")})
						</FormHelperText>
					</Grid>
				)}
			</Grid>
		</GroupBox>
	);
};

export default FileUpload;
