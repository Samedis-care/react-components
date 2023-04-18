import React, { useCallback } from "react";
import ImageBox, { ImageBoxProps } from "./ImageBox";
import { Box, Grid, Theme, Typography } from "@mui/material";
import {
	Star as StarredIcon,
	StarOutline as NotStarredIcon,
} from "@mui/icons-material";
import {
	MultiImageImage,
	MultiImageManipulationCallback,
	MultiImageProcessFile,
	MultiImageProps,
} from "./MultiImage";
import { Styles } from "@mui/styles";
import makeStyles from "@mui/styles/makeStyles";
import useCCTranslations from "../../../utils/useCCTranslations";
import { makeThemeStyles } from "../../../utils";
import { ClassNameMap } from "@mui/styles/withStyles";

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
	 * Function to update primary image ID
	 * @param newId The new primary image ID
	 */
	changePrimary: (newId: string) => void;
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
		changePrimary,
		processFile,
		subClasses,
		onDelete,
	} = props;
	const { t } = useCCTranslations();
	const classes = useThemeStyles(props);

	const setPrimary = useCallback(() => {
		changePrimary(img.id);
	}, [changePrimary, img]);

	const removeImage = useCallback(async () => {
		if (onDelete) {
			// check for confirmation
			if (!(await onDelete(img))) {
				// if user doesn't confirm, abort
				return;
			}
		}
		changeImages((images) => {
			return images.filter((image) => image !== img);
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
					fileName={img.name}
					width={previewSize}
					height={previewSize}
					image={img.image}
					onRemove={img.readOnly ? undefined : removeImage}
					onFilesDropped={img.readOnly ? undefined : replaceImage}
					classes={subClasses?.imageBox}
				/>
			</div>
			<Box mt={1}>
				<Grid
					container
					spacing={1}
					alignItems={"center"}
					justifyContent={"flex-start"}
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
