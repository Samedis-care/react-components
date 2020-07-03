import React, { Component } from "react";
import {
	Button,
	Grid,
	Typography,
	WithStyles,
	withStyles,
} from "@material-ui/core";
import { AttachFile } from "@material-ui/icons";
import FilePreview from "./File";
import { FileSelectorError } from "./Errors";

export interface IProps extends WithStyles {
	/**
	 * Maximum amount of files allowed
	 */
	maxFiles: number;
	/**
	 * Filter for allowed mime types (see <input accept="VALUE">)
	 */
	acceptMime?: string;
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
	 * Called if an error occurred. Should provide feedback to the user
	 * @param err The error that occurred
	 */
	handleError: (err: FileSelectorError) => void;
	/**
	 * Already selected files (for loading existing data)
	 */
	files?: FileData<FileMeta>[];
}

export interface IDownscaleProps {
	/**
	 * The maximum allowed width
	 */
	width: number;
	/**
	 * The maximum allowed height
	 */
	height: number;
	/**
	 * Keep aspect ratio when scaling down?
	 */
	keepRatio: boolean;
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
}

/**
 * On changes to this state also modify shouldComponentUpdate.
 * There is an optimization regarding the dragging handler.
 */
interface IState {
	/**
	 * The uploaded files
	 */
	files: FileData<File | FileMeta>[];
	/**
	 * User is currently dragging stuff around?
	 */
	dragging: number;
}

export interface FileData<T> {
	/**
	 * The file from the file upload
	 */
	file: T;
	/**
	 * The processed image, if present
	 */
	preview?: string;
	/**
	 * Set to true to gray out the image, internal field, should be undefined
	 */
	disable?: boolean;
}

class FileUpload extends Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);

		this.state = {
			files: this.props.files || [],
			dragging: 0,
		};
	}

	shouldComponentUpdate(
		nextProps: Readonly<IProps>,
		nextState: Readonly<IState>,
		nextContext: any
	): boolean {
		if (!this.shallowCompare(this.props, nextProps)) return true;
		// Compare state (except dragging)
		if (this.state.files !== nextState.files) return true;

		// Check for dragging
		return (this.state.dragging ? 1 : 0) !== (nextState.dragging ? 1 : 0);
	}

	shallowCompare = (obj1: any, obj2: any) =>
		Object.keys(obj1).length === Object.keys(obj2).length &&
		Object.keys(obj1).every(
			(key: string) => obj2.hasOwnProperty(key) && obj1[key] === obj2[key]
		);

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
			<>
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
					<Grid item xs>
						<Button
							startIcon={<AttachFile />}
							variant={"contained"}
							color={"primary"}
							onClick={this.handleUpload}
						>
							Upload Files
						</Button>
					</Grid>
					<Grid item xs>
						<Typography align={"right"}>(Formats: any)</Typography>
					</Grid>
					<Grid item xs={12}>
						<Grid
							container
							spacing={2}
							alignContent={"flex-start"}
							alignItems={"flex-start"}
						>
							{this.state.files.map(
								(data: FileData<File | FileMeta>, index) =>
									data && (
										<FilePreview
											name={data.file.name}
											key={index + "-" + data.file.name}
											mimeType={data.file.type}
											size={this.props.previewSize}
											preview={
												this.props.previewImages ? data.preview : undefined
											}
											disabled={data.disable || false}
											onRemove={() => this.removeFile(data)}
										/>
									)
							)}
						</Grid>
					</Grid>
				</Grid>
			</>
		);
	}

	handleUpload = async () => {
		const maxFiles = this.props.maxFiles - this.state.files.length;
		if (maxFiles === 0) {
			this.props.handleError("files.selector.limit-reached");
			return;
		}

		const elem = document.createElement("input");
		elem.type = "file";
		elem.accept = this.props.acceptMime || "";
		elem.multiple = maxFiles > 1;
		elem.addEventListener("change", () => this.processFiles(elem.files));
		elem.click();
	};

	// @ts-ignore
	handleDrop = async (evt: DragEvent<HTMLDivElement>) => {
		evt.preventDefault();

		this.setState({
			dragging: 0,
		});

		return this.processFiles(evt.dataTransfer?.files);
	};

	// @ts-ignore
	handleDragOver = (evt: DragEvent<HTMLDivElement>) => {
		evt.preventDefault();
	};

	handleDragStart = () => {
		this.setState((prevState) => ({
			dragging: prevState.dragging + 1,
		}));
	};

	handleDragStop = () => {
		this.setState((prevState) => ({
			dragging: prevState.dragging - 1,
		}));
	};

	processFiles = async (files?: FileList | null) => {
		const maxFiles = this.props.maxFiles - this.state.files.length;
		const processImages = !!(
			this.props.convertImagesTo ||
			this.props.imageDownscaleOptions ||
			this.props.previewImages
		);

		if (!files) return;
		if (files.length > maxFiles) {
			this.props.handleError("files.selector.too-many");
			return;
		}

		const newFiles: FileData<File>[] = [];
		// tslint:disable-next-line:prefer-for-of
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const isImage = file.type.startsWith("image/");
			if (isImage && processImages) {
				newFiles.push({
					file,
					preview: await this.processImage(file),
				});
			} else {
				newFiles.push({ file });
			}
		}
		this.setState((prevState) => ({
			files: [...prevState.files, ...newFiles],
		}));
	};

	removeFile = (file: FileData<File | FileMeta>) => {
		if (this.props.files?.includes(file)) {
			file.disable = true;
			this.setState((prevState) => ({
				files: [...prevState.files],
			}));
			return;
		}

		this.setState((prevState) => ({
			files: prevState.files.filter((f) => f !== file),
		}));
	};

	processImage = async (file: File): Promise<string> => {
		const downscale = this.props.imageDownscaleOptions;
		const imageFormatTarget = this.props.convertImagesTo || file.type;

		// file -> data url
		const reader = new FileReader();
		const imageData: string = await new Promise((resolve, reject) => {
			reader.addEventListener("loadend", () => {
				resolve(reader.result as string);
			});
			reader.addEventListener("error", () => {
				reject(reader.error);
			});
			reader.readAsDataURL(file);
		});

		// data url -> image
		const image = new Image();
		await new Promise((resolve, reject) => {
			image.addEventListener("load", () => resolve(image));
			image.addEventListener("error", (evt) => reject(evt.error));
			image.src = imageData;
		});

		// calculate new size for down-scaling
		let newWidth = image.width;
		let newHeight = image.height;
		if (
			downscale &&
			(image.width > downscale.width || image.height > downscale.height)
		) {
			if (!downscale.keepRatio) {
				newWidth =
					image.width <= downscale.width ? image.width : downscale.width;
				newHeight =
					image.width <= downscale.height ? image.height : downscale.height;
			} else {
				const downscaleRatio = Math.max(
					image.width / downscale.width,
					image.height / downscale.height
				);
				newWidth = image.width / downscaleRatio;
				newHeight = image.height / downscaleRatio;
			}
		}

		// render image in canvas with new size
		const canvas = document.createElement("canvas");
		canvas.width = newWidth;
		canvas.height = newHeight;
		const ctx = canvas.getContext("2d")!;
		ctx.drawImage(image, 0, 0, newWidth, newHeight);

		// and export it using the specified data format
		return canvas.toDataURL(imageFormatTarget);
	};
}

export default withStyles((theme) => ({
	dropzone: {
		border: `2px solid ${theme.palette.primary.main}`,
	},
}))(FileUpload);
