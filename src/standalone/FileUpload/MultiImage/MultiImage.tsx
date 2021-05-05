import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import ImageBox, { ImageBoxProps } from "./ImageBox";
import { GroupBox } from "../../index";
import {
	DialogTitle,
	DialogContent,
	Grid,
	Link,
	Typography,
	Dialog,
	IconButton,
	Theme,
} from "@material-ui/core";
import { Close as CloseIcon } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { IDownscaleProps } from "../../../utils/processImage";
import { makeThemeStyles, processImage } from "../../../utils";
import ImageDialogEntry, { ImageDialogEntryProps } from "./ImageDialogEntry";
import useCCTranslations from "../../../utils/useCCTranslations";
import { ClassNameMap } from "@material-ui/styles/withStyles";
import { Styles } from "@material-ui/core/styles/withStyles";

export interface MultiImageImage {
	/**
	 * Is the image primary?
	 */
	primary: boolean;
	/**
	 * The URL/Data-URI of the image
	 */
	image: string;
	/**
	 * The file name of the image
	 */
	name: string;
}

export type MultiImageManipulationCallback = (
	images: MultiImageImage[]
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
	 * Placeholder image
	 * Shown to user as "upload" placeholder
	 */
	placeholderImage: string;
	/**
	 * The current images
	 * The first image is considered "primary"
	 */
	images: MultiImageImage[];
	/**
	 * Change event
	 * @param name The name of this field
	 * @param newImages The new images
	 */
	onChange?: (name: string | undefined, newImages: MultiImageImage[]) => void;
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
	capture?: false | "false" | "user" | "environment";
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
	 * Custom CSS styles
	 */
	classes?: ClassNameMap<keyof ReturnType<typeof useStyles>>;
	/**
	 * Custom CSS styles (sub-components)
	 */
	subClasses?: {
		imageBox?: ImageBoxProps["classes"];
		imageDialogEntry?: ImageDialogEntryProps["classes"];
		imageDialogEntrySubClasses?: ImageDialogEntryProps["subClasses"];
	};
}

const useStyles = makeStyles(
	{
		uploadInput: {
			display: "none",
		},
		clickable: {
			cursor: "pointer",
		},
		rootContainer: {
			height: "100%",
		},
		imageItem: {
			height: "calc(100% - 1rem)",
		},
		imageItemReadOnly: {
			height: "100%",
		},
	},
	{ name: "CcMultiImage" }
);

export type MultiImageClassKey = keyof ReturnType<typeof useStyles>;

export type MultiImageTheme = Partial<
	Styles<Theme, MultiImageProps, MultiImageClassKey>
>;

const useThemeStyles = makeThemeStyles<MultiImageProps, MultiImageClassKey>(
	(theme) => theme.componentsCare?.fileUpload?.multiImage?.root,
	"CcMultiImage",
	useStyles
);

const clearPrimary = (img: MultiImageImage): MultiImageImage => ({
	...img,
	primary: false,
});

const MultiImage = (props: MultiImageProps) => {
	const {
		label,
		name,
		editLabel,
		additionalDialogContent,
		images,
		placeholderImage,
		readOnly,
		maxImages,
		capture,
		convertImagesTo,
		downscale,
		onChange,
		subClasses,
		onDelete,
	} = props;
	const previewSize = props.previewSize ?? 256;
	const { t } = useCCTranslations();
	const classes = useThemeStyles(props);

	const primaryImg = useMemo(
		() => images.find((img) => img.primary) ?? images[0],
		[images]
	);
	const getPrimaryImageIndex = () =>
		images.length === 0 ? 0 : images.indexOf(primaryImg);

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
		[maxImages, images]
	);

	const startUpload = useCallback(() => {
		if (readOnly) return;
		if (!fileUpload.current) return;

		fileUpload.current.click();
	}, [readOnly]);

	const processFile = useCallback(
		(file: File): Promise<string> =>
			processImage(file, convertImagesTo, downscale),
		[convertImagesTo, downscale]
	);

	const processFiles = useCallback(
		async (
			files: FileList,
			markFirstPrimary: boolean
		): Promise<MultiImageImage[]> => {
			const fileArr = Array.from(files);
			return (await Promise.all(fileArr.map(processFile))).map(
				(img, index) => ({
					image: img,
					primary: markFirstPrimary && index === 0,
					name: fileArr[index].name,
				})
			);
		},
		[processFile]
	);

	const handleUploadViaDrop = useCallback(
		async (files: FileList) => {
			if (!onChange) return;
			const newImages = await processFiles(files, false);

			onChange(name, images.concat(newImages));
		},
		[processFiles, name, images, onChange]
	);

	const handleUpload = useCallback(
		(evt: React.ChangeEvent<HTMLInputElement>) => {
			if (!evt.target.files) return;

			void handleUploadViaDrop(evt.target.files);
		},
		[handleUploadViaDrop]
	);

	const handlePreviewDrop = useCallback(
		async (files: FileList) => {
			if (!onChange) return;

			const newImages: MultiImageImage[] = await processFiles(files, true);
			onChange(name, images.map(clearPrimary).concat(newImages));
		},
		[onChange, name, images, processFiles]
	);

	useEffect(() => {
		if (currentImage >= images.length) {
			setCurrentImage(images.length - 1);
		}
	}, [currentImage, images]);
	useEffect(() => {
		setCurrentImage(getPrimaryImageIndex);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [primaryImg]);

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
		[onChange, name, images]
	);

	return (
		<>
			<GroupBox label={label}>
				<Grid container spacing={1} className={classes.rootContainer}>
					<Grid
						item
						xs={12}
						className={readOnly ? classes.imageItemReadOnly : classes.imageItem}
					>
						<ImageBox
							image={images[currentImage]?.image ?? placeholderImage}
							onPrevImage={currentImage === 0 ? undefined : showPrevImage}
							onNextImage={
								currentImage < images.length - 1 ? showNextImage : undefined
							}
							onFilesDropped={readOnly ? undefined : handlePreviewDrop}
							onClick={images[currentImage] ? undefined : startUpload}
							classes={subClasses?.imageBox}
						/>
					</Grid>
					{!readOnly && (
						<Grid item xs={12}>
							<Typography variant={"body2"} align={"right"}>
								<Link onClick={openDialog} className={classes.clickable}>
									{editLabel ?? t("standalone.file-upload.multi-image.edit")}
								</Link>
							</Typography>
						</Grid>
					)}
				</Grid>
			</GroupBox>
			<input
				type={"file"}
				multiple={remainingFiles > 1}
				accept={"image/*"}
				capture={capture}
				ref={fileUpload}
				onChange={handleUpload}
				className={classes.uploadInput}
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
							<Grid container justify={"flex-end"}>
								<Grid item>
									<IconButton onClick={closeDialog}>
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
											image={placeholderImage}
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
										style={
											previewSize
												? { width: previewSize, height: previewSize }
												: undefined
										}
									>
										{elem}
									</Grid>
								))}
							</Grid>
						</DialogContent>
					</Dialog>
				</>
			)}
		</>
	);
};

export default React.memo(MultiImage);