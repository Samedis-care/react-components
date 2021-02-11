import React, { useCallback, useState, useRef } from "react";
import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import GroupBox from "../../standalone/GroupBox";
import { Cancel, Star, AddAPhoto } from "@material-ui/icons";
import { IDownscaleProps } from "../../utils/processImage";
import { processImage } from "../../utils";
/**
 * Object properties for image
 */
export interface ImageControllerEntry {
	/**
	 * The base64 string of signature
	 */
	src: string;
	/**
	 * Boolean flag to set primary image
	 */
	primary: boolean;
}
export interface ImageControllerProps {
	/**
	 * The name of the input
	 */
	name: string;
	/**
	 * The html for group box
	 */
	infoText?: React.ReactNode;
	/**
	 * Show info text?
	 */
	showInfoText: boolean;
	/**
	 * The label for primary button
	 */
	setPrimaryLabel?: string;
	/**
	 * The label of the group box
	 */
	groupBoxLabel?: string;
	/**
	 * Callback for change in file upload
	 */
	handleChangeAction: React.ChangeEventHandler<{ name: string; value: string }>;
	/**
	 * Callback method to set primary image
	 */
	handlePrimaryAction: (values: ImageControllerEntry[]) => void;
	/**
	 * List of images in image box
	 */
	uploadedImages: ImageControllerEntry[];
	/**
	 * Is the control read-only?
	 */
	readOnly: boolean;
	/**
	 * MimeType to convert the image to (e.g. image/png or image/jpg)
	 */
	convertImagesTo?: string;
	/**
	 * Settings to downscale an image
	 */
	downscale?: IDownscaleProps;
	/**
	 * Custom styles
	 */
	classes?: Partial<ReturnType<typeof useStyles>>;
}

const useStyles = makeStyles((theme) => ({
	closeIcon: {
		position: "absolute",
		cursor: "pointer",
		color: theme.palette.action.active,
		right: 0,
	},
	layout: {
		position: "relative",
		margin: "30px",
		height: "275px",
		backgroundColor: theme.palette.background.default,
		borderRadius: "10px",
		width: "275px",
	},
	layoutAdd: {
		position: "relative",
		margin: "30px",
		height: "275px",
		borderRadius: "10px",
		width: "275px",
	},
	groupBoxlayout: {
		margin: "30px",
		borderRadius: "10px",
		height: "275px",
		width: "275px",
	},
	changeEventHelper: {
		display: "none",
	},
	addPhoto: {
		height: "50px",
		width: "50px",
		cursor: "pointer",
		color: theme.palette.action.active,
	},
	addPhotoContainer: {
		height: "275px",
		width: "275px",
		objectFit: "contain",
		textAlign: "center",
		display: "table-cell",
		verticalAlign: "middle",
		borderRadius: "10px",
		backgroundColor: theme.palette.action.hover,
	},
	primaryIcon: {
		margin: "30px",
	},
}));

const ImageController = (props: ImageControllerProps) => {
	const {
		showInfoText,
		setPrimaryLabel,
		groupBoxLabel,
		infoText,
		readOnly,
		downscale,
		convertImagesTo,
		uploadedImages,
		handleChangeAction,
		handlePrimaryAction,
	} = props;
	const classes = useStyles(props);

	const [localuploadedImages, setImages] = useState<ImageControllerEntry[]>([
		...uploadedImages,
	]);
	const changeRef = useRef<HTMLInputElement>(null);
	const processFile = useCallback(
		async (file: File) => {
			if (!changeRef.current) return;

			const value = await processImage(file, convertImagesTo, downscale);
			const newUploadedImages = [
				...localuploadedImages,
				{ src: value, primary: false },
			];
			setImages(newUploadedImages);
			// eslint-disable-next-line @typescript-eslint/unbound-method
			const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
				window.HTMLInputElement.prototype,
				"value"
			)?.set;
			nativeInputValueSetter?.call(changeRef.current, value);

			const event = new Event("input", { bubbles: true });
			changeRef.current.dispatchEvent(event);
		},
		[convertImagesTo, downscale, localuploadedImages, setImages]
	);
	// upload click handler
	const handleUpload = useCallback(() => {
		const elem = document.createElement("input");
		elem.type = "file";
		elem.accept = "image/*";
		elem.multiple = false;
		elem.addEventListener("change", () => {
			const files = elem.files;
			if (!files) return;
			const file = files[0];
			if (!file) return;
			void processFile(file);
		});
		elem.click();
	}, [processFile]);
	const changePrimaryImage = useCallback(
		(index) => {
			const newUpdatedImages = localuploadedImages.map((ele, ind) => {
				if (index === ind) {
					ele.primary = !ele.primary;
				} else {
					ele.primary = false;
				}
				return ele;
			});
			setImages(newUpdatedImages);
			handlePrimaryAction(newUpdatedImages);
		},
		[localuploadedImages, handlePrimaryAction]
	);
	const removeImageHandler = useCallback(
		(index) => {
			localuploadedImages.splice(index, 1);
			setImages([...localuploadedImages]);
			handlePrimaryAction([...localuploadedImages]);
		},
		[localuploadedImages, setImages, handlePrimaryAction]
	);
	const handleDrop = useCallback(
		async (evt: React.DragEvent<HTMLDivElement>) => {
			if (readOnly) return;

			evt.preventDefault();

			await processFile(evt.dataTransfer?.files[0]);
		},
		[readOnly, processFile]
	);

	const handleDragOver = useCallback(
		(evt: React.DragEvent<HTMLDivElement>) => {
			if (readOnly) return;

			evt.preventDefault();
		},
		[readOnly]
	);
	return (
		<Grid item>
			<Grid container spacing={2}>
				{localuploadedImages.map((image, i) => (
					<Grid key={i}>
						<Grid item xs className={classes.layout}>
							{!image.primary && (
								<Cancel
									onClick={() => removeImageHandler(i)}
									className={classes.closeIcon}
								/>
							)}
							<img
								src={image.src}
								alt={props.name}
								className={classes.addPhotoContainer}
							/>
						</Grid>
						<Grid container alignItems="center" className={classes.primaryIcon}>
							<Star
								color={image.primary ? "primary" : "disabled"}
								onClick={() => changePrimaryImage(i)}
							/>
							{setPrimaryLabel}
						</Grid>
					</Grid>
				))}
				{!readOnly && (
					<Grid className={classes.layoutAdd}>
						<Grid item xs onDrop={handleDrop} onDragOver={handleDragOver}>
							<div className={classes.addPhotoContainer}>
								<AddAPhoto
									className={classes.addPhoto}
									onClick={handleUpload}
								/>
							</div>
							<input
								type={"text"}
								name={props.name}
								ref={changeRef}
								className={classes.changeEventHelper}
								onChange={handleChangeAction}
							/>
						</Grid>
					</Grid>
				)}
				{showInfoText && (
					<Grid className={classes.groupBoxlayout}>
						<GroupBox label={groupBoxLabel}>{infoText}</GroupBox>
					</Grid>
				)}
			</Grid>
		</Grid>
	);
};
export default React.memo(ImageController);
