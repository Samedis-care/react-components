import React, { useCallback, useRef } from "react";
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
	 * Handler for update images
	 */
	onUpdateImages: (values: ImageControllerEntry[]) => void;
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
	/**
	 * Allow capture?
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/capture
	 */
	capture: false | "false" | "user" | "environment";
}

const useStyles = makeStyles(
	(theme) => ({
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
	}),
	{ name: "CcImageController" }
);

const ImageController = (props: ImageControllerProps) => {
	const {
		showInfoText,
		setPrimaryLabel,
		groupBoxLabel,
		infoText,
		capture,
		readOnly,
		downscale,
		convertImagesTo,
		uploadedImages,
		onUpdateImages,
	} = props;
	const classes = useStyles(props);
	const fileRef = useRef<HTMLInputElement>(null);
	const processFile = useCallback(
		async (file: File) => {
			if (!onUpdateImages) return;
			const value = await processImage(file, convertImagesTo, downscale);
			onUpdateImages([...uploadedImages, { src: value, primary: false }]);
		},
		[uploadedImages, onUpdateImages, convertImagesTo, downscale]
	);
	// upload click handler
	const handleUpload = useCallback(() => {
		const elem = fileRef.current;
		if (!elem) return;
		if (capture && capture !== "false") {
			elem.setAttribute("capture", capture);
		}
		elem.click();
	}, [capture]);
	const changePrimaryImage = useCallback(
		(index) => {
			onUpdateImages(
				uploadedImages.map((img, i) => ({
					...img,
					primary: i === index && !img.primary,
				}))
			);
		},
		[uploadedImages, onUpdateImages]
	);
	const removeImageHandler = useCallback(
		(index) => {
			uploadedImages.splice(index, 1);
			onUpdateImages([...uploadedImages]);
		},
		[uploadedImages, onUpdateImages]
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
	const handleFileChange = useCallback(
		async (evt: React.ChangeEvent<HTMLInputElement>) => {
			const elem = evt.currentTarget;
			const file = elem.files && elem.files[0];
			if (!file) return;
			await processFile(file);
		},
		[processFile]
	);
	return (
		<Grid item>
			<Grid container spacing={2}>
				{uploadedImages.map((image, i) => (
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
								type={"file"}
								accept={"image/*"}
								ref={fileRef}
								onChange={handleFileChange}
								className={classes.changeEventHelper}
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
