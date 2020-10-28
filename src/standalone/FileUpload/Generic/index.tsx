import React, { Component } from "react";
import {
	Button,
	createStyles,
	FormHelperText,
	Grid,
	Theme,
	Typography,
	WithStyles,
	withStyles,
} from "@material-ui/core";
import { AttachFile } from "@material-ui/icons";
import FilePreview from "./File";
import { FileSelectorError } from "./Errors";
import i18n from "../../../i18n";
import {
	getFileExt,
	matchMime,
	processImage,
	shallowCompare,
} from "../../../utils";
import { IDownscaleProps } from "../../../utils/processImage";
import GroupBox from "../../GroupBox";

export interface FileUploadProps extends WithStyles {
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
	 * Already selected files (for loading existing data)
	 */
	files?: FileData<FileMeta>[];
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

/**
 * On changes to this state also modify shouldComponentUpdate.
 * There is an optimization regarding the dragging handler.
 */
interface IState {
	/**
	 * The uploaded files
	 */
	files: FileData[];
	/**
	 * User is currently dragging stuff around?
	 */
	dragging: number;
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

class FileUpload extends Component<FileUploadProps, IState> {
	constructor(props: FileUploadProps) {
		super(props);

		this.state = {
			files: (this.props.files || []).map((meta) => ({
				...meta,
				canBeUploaded: false,
				delete: false,
			})),
			dragging: 0,
		};
	}

	shouldComponentUpdate(
		nextProps: Readonly<FileUploadProps>,
		nextState: Readonly<IState>
	): boolean {
		if (!shallowCompare(this.props, nextProps)) return true;
		// Compare state (except dragging)
		if (this.state.files !== nextState.files) return true;

		// Check for dragging
		return (this.state.dragging ? 1 : 0) !== (nextState.dragging ? 1 : 0);
	}

	componentDidMount() {
		document.addEventListener("dragenter", this.handleDragStart);
		document.addEventListener("dragleave", this.handleDragStop);
	}

	componentWillUnmount() {
		document.removeEventListener("dragenter", this.handleDragStart);
		document.removeEventListener("dragleave", this.handleDragStop);
	}

	render() {
		return (
			<GroupBox label={this.props.label}>
				<Grid
					container
					spacing={2}
					alignContent={"space-between"}
					onDrop={this.handleDrop}
					onDragOver={this.handleDragOver}
					className={
						"components-care-dropzone" +
						(this.state.dragging ? " " + this.props.classes.dropzone : "")
					}
				>
					{!this.props.readOnly && (
						<Grid item xs key={"upload"}>
							<Button
								startIcon={<AttachFile />}
								variant={"contained"}
								color={"primary"}
								onClick={this.handleUpload}
								onBlur={this.props.onBlur}
							>
								{this.props.uploadLabel ||
									i18n.t("standalone.file-upload.upload")}
							</Button>
						</Grid>
					)}
					<Grid item xs={12} key={"files"}>
						<Grid
							container
							spacing={2}
							alignContent={"flex-start"}
							alignItems={"flex-start"}
						>
							{this.state.files.map(
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
											size={this.props.previewSize}
											preview={
												this.props.previewImages ? data.preview : undefined
											}
											disabled={data.delete || false}
											onRemove={
												this.props.readOnly || data.preventDelete
													? undefined
													: () => this.removeFile(data)
											}
										/>
									)
							)}
							{this.props.readOnly && this.state.files.length === 0 && (
								<Grid item>
									<Typography>
										{i18n.t("standalone.file-upload.no-files")}
									</Typography>
								</Grid>
							)}
						</Grid>
					</Grid>
					{!this.props.readOnly && (
						<Grid item xs={12} key={"info"}>
							<FormHelperText className={this.props.classes.formatText}>
								({i18n.t("standalone.file-upload.formats")}:{" "}
								{this.props.acceptLabel ||
									this.props.accept ||
									i18n.t("standalone.file-upload.format.any")}
								)
							</FormHelperText>
						</Grid>
					)}
				</Grid>
			</GroupBox>
		);
	}

	handleUpload = () => {
		let maxFiles = 2;
		if (this.props.maxFiles) {
			maxFiles = this.getRemainingFileCount();
			if (maxFiles === 0) {
				this.props.handleError(
					"files.selector.limit-reached",
					i18n.t("standalone.file-upload.error.limit-reached")
				);
				return;
			}
		}

		const elem = document.createElement("input");
		elem.type = "file";
		elem.accept = this.props.accept || "";
		elem.multiple = maxFiles > 1;
		elem.addEventListener("change", () => {
			void this.processFiles(elem.files);
		});
		elem.click();
	};

	handleDrop = async (evt: React.DragEvent<HTMLDivElement>) => {
		if (this.props.readOnly) return;

		evt.preventDefault();

		this.setState({
			dragging: 0,
		});

		return this.processFiles(evt.dataTransfer?.files);
	};

	handleDragOver = (evt: React.DragEvent<HTMLDivElement>) => {
		if (this.props.readOnly) return;

		evt.preventDefault();
	};

	handleDragStart = () => {
		if (this.props.readOnly) return;

		this.setState((prevState) => ({
			dragging: prevState.dragging + 1,
		}));
	};

	handleDragStop = () => {
		if (this.props.readOnly) return;

		this.setState((prevState) => ({
			dragging: prevState.dragging - 1,
		}));
	};

	getRemainingFileCount = () => {
		if (!this.props.maxFiles)
			throw new Error("max files isn't set, this function shouldn't be called");

		return (
			this.props.maxFiles -
			this.state.files.filter((file) => !file.delete).length
		);
	};

	processFiles = async (files?: FileList | null) => {
		const processImages = !!(
			this.props.convertImagesTo ||
			this.props.imageDownscaleOptions ||
			this.props.previewImages
		);

		if (!files) return;

		if (this.props.maxFiles) {
			const maxFiles = this.getRemainingFileCount();
			if (files.length > maxFiles) {
				this.props.handleError(
					"files.selector.too-many",
					i18n.t("standalone.file-upload.error.too-many")
				);
				return;
			}
		}

		const newFiles: FileData<File>[] = [];
		// tslint:disable-next-line:prefer-for-of
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const isImage = file.type.startsWith("image/");
			if (isImage && processImages) {
				newFiles.push({
					file,
					preview: await processImage(
						file,
						this.props.convertImagesTo,
						this.props.imageDownscaleOptions
					),
					canBeUploaded: true,
					delete: false,
				});
			} else {
				newFiles.push({ file, canBeUploaded: true, delete: false });
			}
		}

		if (this.props.accept) {
			const allowedTypes = this.props.accept
				.split(",")
				.map((type) => type.trim());
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
				this.props.handleError(
					"files.type.invalid",
					i18n.t("standalone.file-upload.error.invalid-type")
				);
				return;
			}
		}

		this.setState(
			(prevState) => ({
				files: this.props.allowDuplicates
					? [...prevState.files, ...newFiles]
					: [
							...prevState.files.filter(
								// check for file name duplicates and replace
								(file) =>
									!newFiles
										.map((newFile) => newFile.file.name)
										.includes(file.file.name)
							),
							...newFiles,
					  ],
			}),
			() => {
				if (this.props.onChange) this.props.onChange(this.state.files);
			}
		);
	};

	removeFile = (file: FileData<File | FileMeta>) => {
		if (this.props.files?.includes(file)) {
			file.delete = true;
			this.setState(
				(prevState) => ({
					files: [...prevState.files],
				}),
				() => {
					if (this.props.onChange) this.props.onChange(this.state.files);
				}
			);
			return;
		}

		this.setState(
			(prevState) => ({
				files: prevState.files.filter((f) => f !== file),
			}),
			() => {
				if (this.props.onChange) this.props.onChange(this.state.files);
			}
		);
	};
}

const styles = createStyles((theme: Theme) => ({
	dropzone: {
		border: `2px solid ${theme.palette.primary.main}`,
	},
	formatText: {
		textAlign: "right",
	},
}));

export default withStyles(styles)(FileUpload);
