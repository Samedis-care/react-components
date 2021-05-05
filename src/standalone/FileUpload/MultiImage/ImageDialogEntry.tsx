import React, { useCallback } from "react";
import ImageBox, { ImageBoxProps } from "./ImageBox";
import { Box, Grid, Theme, Typography } from "@material-ui/core";
import {
	Star as StarredIcon,
	StarOutline as NotStarredIcon,
} from "@material-ui/icons";
import {
	MultiImageImage,
	MultiImageManipulationCallback,
	MultiImageProcessFile,
	MultiImageProps,
} from "./MultiImage";
import { makeStyles } from "@material-ui/core/styles";
import useCCTranslations from "../../../utils/useCCTranslations";
import { Styles } from "@material-ui/core/styles/withStyles";
import { makeThemeStyles } from "../../../utils";
import { ClassNameMap } from "@material-ui/styles/withStyles";

export interface ImageDialogEntryProps
	extends Pick<MultiImageProps, "previewSize"> {
	/**
	 * The image
	 */
	img: MultiImageImage;
	/**
	 * Is the image set to primary
	 */
	isPrimary: boolean;
	/**
	 * Function to update images
	 */
	changeImages: (cb: MultiImageManipulationCallback) => void;
	/**
	 * Process image file
	 */
	processFile: MultiImageProcessFile;
	/**
	 * Delete confirmation handler
	 */
	onDelete?: MultiImageProps["onDelete"];
	/**
	 * Custom CSS styles
	 */
	classes?: ClassNameMap<ImageDialogEntryClassKey>;
	/**
	 * Nested custom CSS styles
	 */
	subClasses?: {
		imageBox?: ImageBoxProps["classes"];
	};
}

const useStyles = makeStyles(
	{
		clickable: {
			cursor: "pointer",
		},
	},
	{ name: "CcImageDialogEntry" }
);

export type ImageDialogEntryClassKey = keyof ReturnType<typeof useStyles>;

export type ImageDialogEntryTheme = Partial<
	Styles<Theme, ImageDialogEntryProps, ImageDialogEntryClassKey>
>;

const useThemeStyles = makeThemeStyles<
	ImageDialogEntryProps,
	ImageDialogEntryClassKey
>(
	(theme) => theme.componentsCare?.fileUpload?.multiImage?.imageDialogEntry,
	"CcImageDialogEntry",
	useStyles
);

const ImageDialogEntry = (props: ImageDialogEntryProps) => {
	const {
		previewSize,
		img,
		isPrimary,
		changeImages,
		processFile,
		subClasses,
		onDelete,
	} = props;
	const { t } = useCCTranslations();
	const classes = useThemeStyles(props);

	const setPrimary = useCallback(() => {
		changeImages((images) =>
			images.map((image) =>
				image.primary === (img === image)
					? image
					: { ...image, primary: img === image }
			)
		);
	}, [changeImages, img]);

	const removeImage = useCallback(async () => {
		if (onDelete) {
			// check for confirmation
			if (!(await onDelete(img))) {
				// if user doesn't confirm, abort
				return;
			}
		}
		changeImages((images) => {
			const newImages = images.filter((image) => image !== img);
			if (newImages.length > 0 && !newImages.find((img) => img.primary)) {
				newImages[0] = { ...newImages[0], primary: true };
			}
			return newImages;
		});
	}, [onDelete, changeImages, img]);

	const replaceImage = useCallback(
		async (files: FileList) => {
			const file = files.item(0);
			if (!file) return;
			const imageData = await processFile(file);

			changeImages((images) =>
				images.map((image) =>
					image === img ? { ...image, image: imageData } : image
				)
			);
		},
		[changeImages, img, processFile]
	);

	return (
		<Grid
			item
			xs={previewSize ? undefined : 12}
			md={previewSize ? undefined : 6}
			lg={previewSize ? undefined : 3}
		>
			<div>
				<ImageBox
					width={previewSize}
					height={previewSize}
					image={img.image}
					onRemove={removeImage}
					onFilesDropped={replaceImage}
					classes={subClasses?.imageBox}
				/>
			</div>
			<Box mt={1}>
				<Grid
					container
					spacing={1}
					alignItems={"center"}
					justify={"flex-start"}
					className={isPrimary ? undefined : classes.clickable}
					onClick={isPrimary ? undefined : setPrimary}
				>
					<Grid item>
						{isPrimary ? <StarredIcon color={"primary"} /> : <NotStarredIcon />}
					</Grid>
					<Grid item>
						<Typography>
							{t("standalone.file-upload.multi-image.primary")}
						</Typography>
					</Grid>
				</Grid>
			</Box>
		</Grid>
	);
};

export default React.memo(ImageDialogEntry);
