import React, { useCallback, useRef, useState } from "react";
import {
	Dialog,
	DialogContent,
	makeStyles,
	IconButton,
	Grid,
} from "@material-ui/core";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import { Close, Star, Cancel, AddAPhoto } from "@material-ui/icons";
import { processImage } from "../../utils";
import { useDialogContext } from "../../framework";
import { IDialogConfigImageBox } from "./Types";
import GroupBox from "../../standalone/GroupBox/index";
import ccI18n from "../../i18n";
const useStyles = makeStyles((theme) => ({
	closeButton: {
		position: "absolute",
		right: theme.spacing(1),
		top: theme.spacing(1),
		color: theme.palette.grey[500],
	},
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
}));
export interface allImages {
	src: string;
	setPrimary: boolean;
}
const ImageDialog = (props: IDialogConfigImageBox) => {
	const [, popDialog] = useDialogContext();
	const classes = useStyles(props);
	const {
		readOnly,
		downscale,
		convertImagesTo,
		uploadedImages,
		onChange,
		onPrimarySelected,
		onUpdateImages,
	} = props;
	const [localuploadedImages, setImages] = useState<allImages[]>([
		...uploadedImages,
	]);
	const closeDialog = () => popDialog();
	const changeRef = useRef<HTMLInputElement>(null);
	const processFile = useCallback(
		async (file: File) => {
			if (!changeRef.current) return;

			const value = await processImage(file, convertImagesTo, downscale);
			const newUploadedImages = [
				...localuploadedImages,
				{ src: value, setPrimary: false },
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
			const newImageArr = localuploadedImages.map((ele, ind) => {
				if (index === ind) {
					ele.setPrimary = !ele.setPrimary;
				} else {
					ele.setPrimary = false;
				}
				return ele;
			});
			setImages(newImageArr);
			onPrimarySelected(newImageArr);
		},
		[localuploadedImages, onPrimarySelected]
	);
	const removeImageHandler = useCallback(
		(index) => {
			localuploadedImages.splice(index, 1);
			setImages([...localuploadedImages]);
			onUpdateImages(localuploadedImages);
		},
		[localuploadedImages, setImages, onUpdateImages]
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
		<Dialog
			onClose={closeDialog}
			maxWidth="lg"
			fullWidth
			disableBackdropClick
			open={true}
		>
			<MuiDialogTitle disableTypography>
				<IconButton
					aria-label="close"
					className={classes.closeButton}
					onClick={closeDialog}
				>
					<Close />
				</IconButton>
			</MuiDialogTitle>
			<DialogContent>
				<Grid item>
					<Grid container spacing={2}>
						{localuploadedImages.map((image, i) => (
							<Grid key={i}>
								<Grid item xs className={classes.layout}>
									{!image.setPrimary && (
										<Cancel
											onClick={() => removeImageHandler(i)}
											className={classes.closeIcon}
										/>
									)}
									<img
										src={image.src}
										alt="img"
										className={classes.addPhotoContainer}
									/>
								</Grid>
								<Grid container alignItems="center" style={{ margin: "30px" }}>
									<Star
										color={image.setPrimary ? "primary" : "disabled"}
										onClick={() => changePrimaryImage(i)}
									/>
									{ccI18n.t(
										"standalone.image-box-control.dialog.primary-button"
									)}
								</Grid>
							</Grid>
						))}
						{!readOnly && (
							<Grid className={classes.layoutAdd}>
								<Grid item xs onDrop={handleDrop} onDragOver={handleDragOver}>
									<div className={classes.addPhotoContainer}>
										<AddAPhoto
											style={{
												height: "50px",
												width: "50px",
												cursor: "pointer",
											}}
											className={classes.addPhoto}
											onClick={handleUpload}
										/>
									</div>
									<input
										type={"text"}
										ref={changeRef}
										className={classes.changeEventHelper}
										onChange={onChange}
									/>
								</Grid>
							</Grid>
						)}
						<Grid className={classes.groupBoxlayout}>
							<GroupBox
								label={ccI18n.t(
									"standalone.image-box-control.dialog.group-label"
								)}
							>
								<ul>
									<li>
										{ccI18n.t(
											"standalone.image-box-control.dialog.group-first"
										)}
									</li>
									<li>
										{ccI18n.t(
											"standalone.image-box-control.dialog.group-second"
										)}
									</li>

									<li>
										{ccI18n.t(
											"standalone.image-box-control.dialog.group-third"
										)}
									</li>
								</ul>
							</GroupBox>
						</Grid>
					</Grid>
				</Grid>
			</DialogContent>
		</Dialog>
	);
};

export const ImageBoxDialog = React.memo(ImageDialog);
