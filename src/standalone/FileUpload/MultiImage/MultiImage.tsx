import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import ImageBox, { ImageBoxProps } from "./ImageBox";
import GroupBox from "../../GroupBox";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	Grid,
	IconButton,
	Link,
	styled,
	Typography,
	useThemeProps,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import processImage, { IDownscaleProps } from "../../../utils/processImage";
import ImageDialogEntry, { ImageDialogEntryProps } from "./ImageDialogEntry";
import useCCTranslations from "../../../utils/useCCTranslations";
import ImageDots from "./ImageDots";
import combineClassNames from "../../../utils/combineClassNames";

export interface MultiImageImage {
	/**
	 * A unique identifier for the image
	 */
	id: string;
	/**
	 * The URL/Data-URI of the image
	 */
	image: string;
	/**
	 * The file name of the image
	 */
	name: string;
	/**
	 * Is the image readonly? Disables delete and replace functionality
	 */
	readOnly?: boolean;
}

export type MultiImageManipulationCallback = (
	images: MultiImageImage[],
) => MultiImageImage[];
export type MultiImageProcessFile = (file: File) => Promise<string>;

export interface MultiImageProps {
	/**
	 * The label of the control
	 */
	label: React.ReactNode;
	/**
	 * The name of this field
	 */
	name?: string;
	/**
	 * Fixed preview size
	 * @default 256
	 */
	previewSize?: number;
	/**
	 * Upload image
	 * Shown to in edit dialog
	 */
	uploadImage: string;
	/**
	 * Placeholder image
	 * Shown in normal on page control if no image present.
	 * Defaults to uploadImage if not set
	 */
	placeholderImage?: string;
	/**
	 * The current images
	 * The first image is considered "primary" unless primary is set
	 */
	images: MultiImageImage[];
	/**
	 * The primary image ID
	 */
	primary: string | null;
	/**
	 * Change event
	 * @param name The name of this field
	 * @param newImages The new images
	 */
	onChange?: (name: string | undefined, newImages: MultiImageImage[]) => void;
	/**
	 * Change event for primary image id
	 * @param name The name of this field
	 * @param primary The new primary image ID or null if no image is present
	 */
	onPrimaryChange?: (name: string | undefined, primary: string | null) => void;
	/**
	 * Callback for delete confirmation
	 * @param image The image that the user wants to delete
	 * @returns Should the delete commence?
	 */
	onDelete?: (image: MultiImageImage) => Promise<boolean> | boolean;
	/**
	 * Custom edit label
	 */
	editLabel?: React.ReactNode;
	/**
	 * The max amount of images
	 */
	maxImages?: number;
	/**
	 * Allow capture?
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/capture
	 */
	capture?: false | "user" | "environment";
	/**
	 * Is the control read-only?
	 */
	readOnly?: boolean;
	/**
	 * MimeType to convert the image to (e.g. image/png or image/jpg)
	 */
	convertImagesTo?: string;
	/**
	 * Settings to downscale an image
	 */
	downscale?: IDownscaleProps;
	/**
	 * Additional dialog content (e.g. how-to-box)
	 */
	additionalDialogContent?: React.ReactNode[];
	/**
	 * custom CSS class to apply to root
	 */
	className?: string;
	/**
	 * Custom CSS styles
	 */
	classes?: Partial<Record<MultiImageClassKey, string>>;
	/**
	 * Custom CSS styles (sub-components)
	 */
	subClasses?: {
		imageBox?: ImageBoxProps["classes"];
		imageDialogEntry?: ImageDialogEntryProps["classes"];
		imageDialogEntrySubClasses?: ImageDialogEntryProps["subClasses"];
	};
}

const Root = styled("div", {
	name: "CcMultiImage",
	slot: "root",
})({});

const UploadInput = styled("input", {
	name: "CcMultiImage",
	slot: "uploadInput",
})({
	display: "none",
});

const RootContainer = styled(Grid, {
	name: "CcMultiImage",
	slot: "rootContainer",
})({
	height: "100%",
});

const ImageItem = styled(Grid, { name: "CcMultiImage", slot: "imageItem" })({
	height: "calc(100% - 1rem)",
});

export type MultiImageClassKey =
	| "root"
	| "uploadInput"
	| "rootContainer"
	| "imageItem";

export const MultiImageNewIdPrefix = "MultiImage-New-";

const MultiImage = (inProps: MultiImageProps) => {
	const props = useThemeProps({ props: inProps, name: "CcMultiImage" });
	const {
		label,
		name,
		editLabel,
		additionalDialogContent,
		images,
		primary,
		placeholderImage,
		uploadImage,
		readOnly,
		maxImages,
		capture,
		convertImagesTo,
		downscale,
		onChange,
		onPrimaryChange,
		subClasses,
		onDelete,
		className,
		classes,
	} = props;
	const previewSize = props.previewSize ?? 256;
	const { t } = useCCTranslations();

	const primaryImg = useMemo(
		(): MultiImageImage | undefined =>
			images.find((img) => img.id === primary) ?? images[0],
		[images, primary],
	);

	// images.indexOf(undefined) works and returns -1
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const getPrimaryImageIndex = () => images.indexOf(primaryImg!);

	// update primary image ID if it becomes invalid
	useEffect(() => {
		if (!onPrimaryChange) return;
		if (!primaryImg) {
			onPrimaryChange(name, null);
			return;
		}
		if (primaryImg.id === primary) return;
		onPrimaryChange(name, primaryImg.id);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [onPrimaryChange, primary, primaryImg]);

	const [dialogOpen, setDialogOpen] = useState(false);
	const [currentImage, setCurrentImage] = useState(getPrimaryImageIndex);
	const fileUpload = useRef<HTMLInputElement | null>(null);

	const openDialog = useCallback(() => {
		setDialogOpen(true);
	}, []);
	const closeDialog = useCallback(() => {
		setDialogOpen(false);
	}, []);

	const remainingFiles = useMemo(
		() =>
			maxImages
				? Math.max(images.length - maxImages, 0)
				: Number.MAX_SAFE_INTEGER,
		[maxImages, images],
	);

	const startUpload = useCallback(() => {
		if (readOnly) return;
		if (!fileUpload.current) return;

		fileUpload.current.click();
	}, [readOnly]);

	const processFile = useCallback(
		(file: File): Promise<string> =>
			processImage(file, convertImagesTo, downscale),
		[convertImagesTo, downscale],
	);

	const processFiles = useCallback(
		async (files: FileList): Promise<MultiImageImage[]> => {
			const fileArr = Array.from(files);
			return (await Promise.all(fileArr.map(processFile))).map(
				(img, index) => ({
					id: `${MultiImageNewIdPrefix}${new Date().getTime()}-${index}`,
					image: img,
					name: fileArr[index].name,
				}),
			);
		},
		[processFile],
	);

	const handleUploadViaDrop = useCallback(
		async (files: FileList) => {
			if (!onChange) return;
			const newImages = await processFiles(files);

			onChange(name, images.concat(newImages));
		},
		[processFiles, name, images, onChange],
	);

	const handlePreviewDrop = useCallback(
		async (files: FileList) => {
			if (!onChange) return;
			if (files.length === 0) return;

			const newImages: MultiImageImage[] = await processFiles(files);
			onChange(name, images.concat(newImages));
			if (onPrimaryChange) onPrimaryChange(name, newImages[0].id);
		},
		[onChange, name, images, processFiles, onPrimaryChange],
	);

	const handleUpload = useCallback(
		(evt: React.ChangeEvent<HTMLInputElement>) => {
			const files = evt.target.files;
			if (!files) return;
			void handleUploadViaDrop(files);
		},
		[handleUploadViaDrop],
	);

	useEffect(() => {
		if (currentImage >= images.length) {
			setCurrentImage(images.length - 1);
		}
	}, [currentImage, images]);
	useEffect(() => {
		setCurrentImage(getPrimaryImageIndex);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [getPrimaryImageIndex()]);

	const showPrevImage = useCallback(() => {
		setCurrentImage((prev) => (prev === 0 ? prev : prev - 1));
	}, []);
	const showNextImage = useCallback(() => {
		setCurrentImage((prev) => prev + 1);
	}, []);

	const manipulateImages = useCallback(
		(process: MultiImageManipulationCallback) => {
			if (!onChange) return;
			onChange(name, process(images));
		},
		[onChange, name, images],
	);

	const changePrimary = useCallback(
		(id: string) => {
			if (!onPrimaryChange) return;
			onPrimaryChange(name, id);
		},
		[onPrimaryChange, name],
	);

	return (
		<Root className={combineClassNames([className, classes?.root])}>
			<GroupBox label={label}>
				<RootContainer container spacing={1} className={classes?.rootContainer}>
					<ImageItem item xs={12} className={classes?.imageItem}>
						<ImageBox
							image={
								images[currentImage]?.image ?? placeholderImage ?? uploadImage
							}
							fileName={images[currentImage]?.name}
							onPrevImage={currentImage <= 0 ? undefined : showPrevImage}
							onNextImage={
								currentImage < images.length - 1 ? showNextImage : undefined
							}
							onFilesDropped={readOnly ? undefined : handlePreviewDrop}
							onClick={
								images[currentImage] ? undefined : readOnly ? null : startUpload
							}
							classes={subClasses?.imageBox}
							imageDots={{
								total: images.length,
								active: currentImage,
								setActive: setCurrentImage,
							}}
							disableBackground
						/>
					</ImageItem>
					<Grid
						item
						xs={12}
						container
						alignContent={"space-between"}
						wrap={"nowrap"}
						spacing={1}
					>
						<Grid item xs>
							<ImageDots
								total={images.length}
								active={currentImage}
								setActive={setCurrentImage}
							/>
						</Grid>
						{!readOnly && (
							<Grid item>
								<Typography variant={"body2"}>
									<Link onClick={openDialog} href={"#"}>
										{editLabel ?? t("standalone.file-upload.multi-image.edit")}
									</Link>
								</Typography>
							</Grid>
						)}
					</Grid>
				</RootContainer>
			</GroupBox>
			<UploadInput
				type={"file"}
				multiple={remainingFiles > 1}
				accept={"image/*"}
				capture={capture}
				ref={fileUpload}
				onChange={handleUpload}
				className={classes?.uploadInput}
			/>
			{!readOnly && (
				<>
					<Dialog
						open={dialogOpen}
						onClose={closeDialog}
						maxWidth={"lg"}
						fullWidth={!previewSize}
					>
						<DialogTitle>
							<Grid container justifyContent={"flex-end"}>
								<Grid item>
									<IconButton onClick={closeDialog} size="large">
										<CloseIcon />
									</IconButton>
								</Grid>
							</Grid>
						</DialogTitle>
						<DialogContent>
							<Grid container spacing={2}>
								{images.map((img, i) => (
									<ImageDialogEntry
										img={img}
										previewSize={previewSize}
										isPrimary={img === primaryImg}
										processFile={processFile}
										changeImages={manipulateImages}
										changePrimary={changePrimary}
										onDelete={onDelete}
										key={`img-${i}`}
										classes={subClasses?.imageDialogEntry}
										subClasses={subClasses?.imageDialogEntrySubClasses}
									/>
								))}
								{!readOnly && remainingFiles > 0 && (
									<Grid
										item
										xs={previewSize ? undefined : 12}
										md={previewSize ? undefined : 6}
										lg={previewSize ? undefined : 3}
									>
										<ImageBox
											width={previewSize}
											height={previewSize}
											image={uploadImage}
											onClick={startUpload}
											onFilesDropped={handleUploadViaDrop}
											classes={subClasses?.imageBox}
										/>
									</Grid>
								)}
								{additionalDialogContent?.map((elem, i) => (
									<Grid
										item
										xs={previewSize ? undefined : 12}
										md={previewSize ? undefined : 6}
										lg={previewSize ? undefined : 3}
										key={`add-${i}`}
										style={previewSize ? { width: previewSize } : undefined}
									>
										{elem}
									</Grid>
								))}
							</Grid>
						</DialogContent>
					</Dialog>
				</>
			)}
		</Root>
	);
};

export default React.memo(MultiImage);
