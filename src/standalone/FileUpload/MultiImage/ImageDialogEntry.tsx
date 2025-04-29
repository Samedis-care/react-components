import React, { useCallback } from "react";
import ImageBox, { ImageBoxProps } from "./ImageBox";
import { Box, Grid, styled, Typography, useThemeProps } from "@mui/material";
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
import useCCTranslations from "../../../utils/useCCTranslations";
import combineClassNames from "../../../utils/combineClassNames";

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
	 * Custom CSS class to apply to root
	 */
	className?: string;
	/**
	 * Custom CSS styles
	 */
	classes?: Partial<Record<ImageDialogEntryClassKey, string>>;
	/**
	 * Nested custom CSS styles
	 */
	subClasses?: {
		imageBox?: ImageBoxProps["classes"];
	};
}

const Root = styled(Grid, { name: "CcImageDialogEntry", slot: "root" })({});
const MakePrimary = styled(Grid, {
	name: "CcImageDialogEntry",
	slot: "makePrimary",
})({
	cursor: "pointer",
});
const IsPrimary = styled(Grid, {
	name: "CcImageDialogEntry",
	slot: "isPrimary",
})({});

export type ImageDialogEntryClassKey = "root" | "makePrimary" | "isPrimary";

const ImageDialogEntry = (inProps: ImageDialogEntryProps) => {
	const props = useThemeProps({ props: inProps, name: "CcImageDialogEntry" });
	const {
		previewSize,
		img,
		isPrimary,
		changeImages,
		changePrimary,
		processFile,
		subClasses,
		onDelete,
		className,
		classes,
	} = props;
	const { t } = useCCTranslations();

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
					image === img ? { ...image, image: imageData } : image,
				),
			);
		},
		[changeImages, img, processFile],
	);

	const PrimaryComp = isPrimary ? IsPrimary : MakePrimary;

	return (
		<Root
			size={previewSize ? undefined : { xs: 12, md: 6, lg: 3 }}
			className={combineClassNames([className, classes?.root])}
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
				<PrimaryComp
					container
					spacing={1}
					alignItems={"center"}
					justifyContent={"flex-start"}
					className={isPrimary ? classes?.isPrimary : classes?.makePrimary}
					onClick={isPrimary ? undefined : setPrimary}
				>
					<Grid>
						{isPrimary ? <StarredIcon color={"primary"} /> : <NotStarredIcon />}
					</Grid>
					<Grid>
						<Typography>
							{t("standalone.file-upload.multi-image.primary")}
						</Typography>
					</Grid>
				</PrimaryComp>
			</Box>
		</Root>
	);
};

export default React.memo(ImageDialogEntry);
