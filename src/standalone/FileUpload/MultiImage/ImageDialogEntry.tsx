import React, { useCallback, useId, useRef } from "react";
import ImageBox, { ImageBoxProps } from "./ImageBox";
import {
	ButtonBase,
	Grid,
	IconButton,
	styled,
	Theme,
	Typography,
	useThemeProps,
} from "@mui/material";
import {
	Delete as DeleteIcon,
	Star as StarredIcon,
	StarBorder as NotStarredIcon,
	SwapHoriz as ReplaceIcon,
} from "@mui/icons-material";
import {
	MultiImageImage,
	MultiImageManipulationCallback,
	MultiImageProcessFile,
	MultiImageProps,
} from "./MultiImage";
import useCCTranslations from "../../../utils/useCCTranslations";
import combineClassNames from "../../../utils/combineClassNames";
import { ImageErrorReporter } from "../useImageError";

export interface ImageDialogEntryProps extends Pick<
	MultiImageProps,
	"previewSize" | "disableRotation"
> {
	/**
	 * The image
	 */
	img: MultiImageImage;
	/**
	 * Is the image set to primary? The primary image's toggle button is pressed and shows a
	 * filled star and "Primary image", the others show an outline star and "Set as primary
	 * image"
	 */
	isPrimary: boolean;
	/**
	 * Applies a change to the field's images: the callback gets them as they are when this is
	 * called, after a removal (once onDelete agreed) or a replacement (once the file is
	 * processed), and returns the new list, or the list it got when nothing changes
	 */
	changeImages: (cb: MultiImageManipulationCallback) => void;
	/**
	 * Function to update primary image ID, called when the make-primary button of an image
	 * that is not the primary one is activated
	 * @param newId The new primary image ID
	 */
	changePrimary: (newId: string) => void;
	/**
	 * Process image file: decodes and converts the file that replaces the image, picked with
	 * the Replace button or dropped onto the image (only the first file of a drop is used)
	 */
	processFile: MultiImageProcessFile;
	/**
	 * Called if processFile failed, shows the error to the user
	 */
	onImageError: ImageErrorReporter;
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
const Actions = styled("div", {
	name: "CcImageDialogEntry",
	slot: "actions",
})(({ theme }) => ({
	display: "flex",
	flexWrap: "wrap",
	alignItems: "center",
	gap: theme.spacing(0.5),
	marginTop: theme.spacing(1),
	// as wide as the image: adds no width of its own to the entry, wraps instead
	width: 0,
	minWidth: "100%",
	// MUI shows keyboard focus on these buttons as a faint ripple at most
	"& .Mui-focusVisible": {
		outline: `2px solid ${theme.palette.primary.main}`,
		outlineOffset: 2,
	},
}));
const PrimaryButton = styled(ButtonBase, {
	name: "CcImageDialogEntry",
	slot: "primaryButton",
})(({ theme }) => ({
	// takes the room Replace and Remove leave and wraps its text there; they move to a row of
	// their own only when its longest word does not fit beside them
	flex: "1 1 0",
	justifyContent: "flex-start",
	textAlign: "start",
	padding: theme.spacing(0.5),
	borderRadius: theme.shape.borderRadius,
	// the primary image's button does nothing
	"&[aria-pressed='true']": {
		cursor: "default",
	},
}));
const ChangeButtons = styled("span", {
	name: "CcImageDialogEntry",
	slot: "changeButtons",
})(({ theme }) => ({
	// Replace and Remove wrap together, and stay at the end of the row
	display: "flex",
	gap: theme.spacing(0.5),
	marginLeft: "auto",
}));
const primaryLabelStyles = ({ theme }: { theme: Theme }) => ({
	display: "inline-flex",
	alignItems: "center",
	gap: theme.spacing(1),
});
const MakePrimary = styled("span", {
	name: "CcImageDialogEntry",
	slot: "makePrimary",
})(primaryLabelStyles);
const IsPrimary = styled("span", {
	name: "CcImageDialogEntry",
	slot: "isPrimary",
})(primaryLabelStyles);

/**
 * Slots of ImageDialogEntry (theme CcImageDialogEntry): root (the Grid item), actions (the
 * row of buttons under the image), primaryButton (the make-primary toggle button), the star
 * and text inside that button: makePrimary for an image that is not the primary one
 * (outline star, "Set as primary image"), isPrimary for the primary image (filled star in
 * the primary colour, "Primary image"), and changeButtons (Replace and Remove, which wrap
 * together; not rendered for a readOnly image)
 */
export type ImageDialogEntryClassKey =
	| "root"
	| "actions"
	| "primaryButton"
	| "makePrimary"
	| "isPrimary"
	| "changeButtons";

/**
 * One image in MultiImage's edit dialog: the image (a click opens the full-screen view, a
 * file dropped onto it replaces it), and under it a make-primary toggle button
 * (`aria-pressed`) and, unless the image is readOnly, Replace (opens the file picker) and
 * Remove. The toggle button reads "Primary image" with a filled star on the primary image,
 * and "Set as primary image" with an outline star on the others, so the primary image is
 * told apart by more than colour. Each button is named after its text and the image's file
 * name. Internal to MultiImage.
 */
const ImageDialogEntry = (inProps: ImageDialogEntryProps) => {
	const props = useThemeProps({ props: inProps, name: "CcImageDialogEntry" });
	const {
		previewSize,
		img,
		isPrimary,
		changeImages,
		changePrimary,
		processFile,
		onImageError,
		subClasses,
		onDelete,
		disableRotation,
		className,
		classes,
	} = props;
	const { t } = useCCTranslations();
	const id = useId();
	// each action is named after the image it acts on: its own label, then the file name
	const nameId = `${id}-name`;
	const primaryId = `${id}-primary`;
	const replaceId = `${id}-replace`;
	const removeId = `${id}-remove`;
	const replaceInput = useRef<HTMLInputElement | null>(null);

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
		// applied to the images as they are now, which may have changed while onDelete asked
		changeImages((images) => {
			const rest = images.filter((image) => image.id !== img.id);
			// already removed, e.g. by a second click on Remove
			return rest.length === images.length ? images : rest;
		});
	}, [onDelete, changeImages, img]);

	const replaceWith = useCallback(
		async (file: File) => {
			let imageData: File;
			try {
				imageData = await processFile(file);
			} catch (e) {
				// the image couldn't be read or the browser couldn't decode it
				onImageError(e);
				return;
			}

			// applied to the images as they are now, which may have changed while the file
			// was processed
			changeImages((images) =>
				// removed meanwhile: there is nothing left to replace
				images.some((image) => image.id === img.id)
					? images.map((image) =>
							image.id === img.id ? { ...image, image: imageData } : image,
						)
					: images,
			);
		},
		[changeImages, img, processFile, onImageError],
	);

	const replaceImage = useCallback(
		async (files: FileList) => {
			const file = files.item(0);
			if (!file) return;
			await replaceWith(file);
		},
		[replaceWith],
	);

	const pickReplacement = useCallback(() => {
		replaceInput.current?.click();
	}, []);

	const handleReplacementPicked = useCallback(
		(evt: React.ChangeEvent<HTMLInputElement>) => {
			const file = evt.currentTarget.files?.[0];
			// browsers fire no change event for a selection equal to the input's value
			evt.currentTarget.value = "";
			if (!file) return;
			void replaceWith(file);
		},
		[replaceWith],
	);

	// only the label's slot, star and text follow the state: the button stays, and keeps
	// focus when its image becomes primary
	const PrimaryLabel = isPrimary ? IsPrimary : MakePrimary;

	return (
		<Root
			size={previewSize ? undefined : { xs: 12, md: 6, lg: 3 }}
			className={combineClassNames([className, classes?.root])}
			// an item of the dialog's list of images (MultiImage)
			role={"listitem"}
		>
			<div>
				<ImageBox
					fileName={img.name}
					width={previewSize}
					height={previewSize}
					image={img.image}
					onFilesDropped={img.readOnly ? undefined : replaceImage}
					classes={subClasses?.imageBox}
					disableRotation={disableRotation}
				/>
			</div>
			<Actions className={classes?.actions}>
				<PrimaryButton
					id={primaryId}
					aria-labelledby={`${primaryId} ${nameId}`}
					aria-pressed={isPrimary}
					onClick={isPrimary ? undefined : setPrimary}
					className={classes?.primaryButton}
				>
					<PrimaryLabel
						className={isPrimary ? classes?.isPrimary : classes?.makePrimary}
					>
						{isPrimary ? <StarredIcon color={"primary"} /> : <NotStarredIcon />}
						<Typography component={"span"}>
							{isPrimary
								? t("standalone.file-upload.multi-image.is-primary")
								: t("standalone.file-upload.multi-image.make-primary")}
						</Typography>
					</PrimaryLabel>
				</PrimaryButton>
				{!img.readOnly && (
					<ChangeButtons className={classes?.changeButtons}>
						<IconButton
							id={replaceId}
							aria-label={t("standalone.file-upload.multi-image.replace")}
							aria-labelledby={`${replaceId} ${nameId}`}
							onClick={pickReplacement}
						>
							<ReplaceIcon />
						</IconButton>
						<IconButton
							id={removeId}
							aria-label={t("standalone.file-upload.multi-image.remove")}
							aria-labelledby={`${removeId} ${nameId}`}
							onClick={removeImage}
						>
							<DeleteIcon />
						</IconButton>
					</ChangeButtons>
				)}
			</Actions>
			<span id={nameId} hidden>
				{img.name}
			</span>
			{!img.readOnly && (
				<input
					ref={replaceInput}
					type={"file"}
					accept={"image/*"}
					hidden
					onChange={handleReplacementPicked}
				/>
			)}
		</Root>
	);
};

export default React.memo(ImageDialogEntry);
