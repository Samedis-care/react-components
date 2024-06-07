import React, { useCallback, useRef, useState } from "react";
import {
	alpha,
	Box,
	Button,
	Dialog,
	Grid,
	IconButton,
	styled,
	Theme,
	Tooltip,
	Typography,
	useThemeProps,
} from "@mui/material";
import {
	AttachFile,
	Person,
	FileUpload as UploadIcon,
	Close as CloseIcon,
} from "@mui/icons-material";
import processImageB64 from "../../../utils/processImageB64";
import combineClassNames from "../../../utils/combineClassNames";
import { IDownscaleProps } from "../../../utils/processImage";
import GroupBox from "../../GroupBox";
import useCCTranslations from "../../../utils/useCCTranslations";
import { ImageFileIcon } from "../FileIcons";
import fileToData from "../../../utils/fileToData";

// resolve to edited image to continue change, or reject to cancel
export type PostImageEditCallback = (image: string) => Promise<string>;

export interface ImageSelectorProps {
	/**
	 * The name of the input
	 */
	name: string;
	/**
	 * The current value of the input
	 */
	value: string;
	/**
	 * Allow capture?
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/capture
	 */
	capture: false | "false" | "user" | "environment";
	/**
	 * The label of the input
	 */
	label?: string;
	/**
	 * The alt text of the image
	 */
	alt: string;
	/**
	 * The label type of the box
	 */
	smallLabel?: boolean;
	/**
	 * The change handler of the input
	 * @param name The field name
	 * @param value The new value (data uri of selected image or empty string)
	 */
	onChange?: (name: string, value: string) => void;
	/**
	 * The blur event handler of the input
	 */
	onBlur?: React.FocusEventHandler<HTMLElement>;
	/**
	 * Label overwrite for Upload label
	 */
	uploadLabel?: string;
	/**
	 * Label overwrite for Allowed file formats label
	 * Modern variant only
	 */
	formatsLabel?: string;
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
	 * CSS class to apply to root
	 */
	className?: string;
	/**
	 * Custom styles
	 */
	classes?: Partial<Record<ImageSelectorClassKey, string>>;
	/**
	 * The display variant
	 * @default normal (overridable by theme)
	 */
	variant?: "normal" | "modern" | "profile_picture";
	/**
	 * Post upload image editing callback
	 * @param image The data uri image
	 */
	postEditCallback?: PostImageEditCallback;
}

const RootClassic = styled(Grid, {
	name: "CcImageSelector",
	slot: "rootClassic",
})(({ theme }) => ({
	width: `calc(100% - ${theme.spacing(2)})`,
	height: `calc(100% - ${theme.spacing(2)})`,
	marginTop: theme.spacing(2),
}));

const RootModern = styled(Grid, {
	name: "CcImageSelector",
	slot: "rootModern",
})({
	cursor: "pointer",
	height: "100%",
});

const ImageWrapper = styled(Grid, {
	name: "CcImageSelector",
	slot: "imgWrapper",
})({
	maxHeight: "100%",
});

const PreviewClassic = styled("img", {
	name: "CcImageSelector",
	slot: "previewClassic",
})(({ theme }) => ({
	objectFit: "contain",
	display: "block",
	width: `calc(100% - ${theme.spacing(2)})`,
	height: `calc(100% - ${theme.spacing(2)})`,
}));

const PreviewModern = styled("img", {
	name: "CcImageSelector",
	slot: "previewModern",
})({
	objectFit: "contain",
	display: "block",
	width: "100%",
	height: "100%",
	cursor: "pointer",
});

const ChangeEventHelper = styled("input", {
	name: "CcImageSelector",
	slot: "changeEventHelper",
})({
	display: "none",
});

const ModernUploadLabel = styled(Typography, {
	name: "CcImageSelector",
	slot: "modernUploadLabel",
})(({ theme }) => ({
	color: theme.palette.action.disabled,
})) as typeof Typography;

const ModernFullHeightBox = styled(Box, {
	name: "CcImageSelector",
	slot: "modernFullHeightBox",
})({
	height: "100%",
});

const ModernFullHeightGrid = styled(Grid, {
	name: "CcImageSelector",
	slot: "modernFullHeightGrid",
})({
	height: "100%",
});

const ModernFormatsLabel = styled(Typography, {
	name: "CcImageSelector",
	slot: "modernFormatsLabel",
})(({ theme }) => ({
	color: theme.palette.action.disabled,
}));

const ModernFormatIcon = styled(ImageFileIcon, {
	name: "CcImageSelector",
	slot: "modernFormatIcon",
})(({ theme }) => ({
	color: theme.palette.action.disabled,
}));

const PfpRoot = styled("div", {
	name: "CcImageSelector",
	slot: "pfpRoot",
})({
	height: "100%",
});

const PfpIconButton = styled(IconButton, {
	name: "CcImageSelector",
	slot: "pfpIconBtn",
})({
	width: "100%",
	height: "100%",
	margin: 2, // borderSize in pfpImg * 2
	padding: 0,
});

const pfpImageStyles = ({ theme }: { theme: Theme }) => ({
	width: "100%",
	height: "100%",
	border: `1px lightgray solid`,
	borderRadius: "50%",
	boxShadow: theme.shadows[4],
	textOverflow: "ellipsis",
	overflow: "hidden",
	display: "flex",
	alignItems: "center",
	aspectRatio: "1/1",
});

const PfpImage = styled("img", { name: "CcImageSelector", slot: "pfpImg" })(
	pfpImageStyles,
);

const PfpImagePlaceholder = styled(Person, {
	name: "CcImageSelector",
	slot: "pfpImgPlaceholder",
})(pfpImageStyles);

const ModernUploadControlsWrapper = styled("div", {
	name: "CcImageSelector",
	slot: "modernUploadControlsWrapper",
})(({ theme }) => ({
	position: "absolute",
	bottom: theme.spacing(2),
	right: theme.spacing(2),
	backgroundColor: alpha(theme.palette.background.paper, 0.7),
	borderRadius: theme.shape.borderRadius,
}));

const PreviewDialogCloseButton = styled(IconButton, {
	name: "CcImageSelector",
	slot: "previewDialogCloseButton",
})(({ theme }) => ({
	position: "absolute",
	top: theme.spacing(2),
	right: theme.spacing(2),
}));

export type ImageSelectorClassKey =
	| "rootClassic"
	| "rootModern"
	| "imgWrapper"
	| "previewClassic"
	| "previewModern"
	| "changeEventHelper"
	| "modernUploadLabel"
	| "modernFullHeightBox"
	| "modernFullHeightGrid"
	| "modernFormatsLabel"
	| "modernFormatIcon"
	| "modernUploadControlsWrapper"
	| "previewDialogCloseButton"
	| "pfpRoot"
	| "pfpIconBtn"
	| "pfpImg"
	| "pfpImgPlaceholder";

const ImageSelector = (inProps: ImageSelectorProps) => {
	const props = useThemeProps({ props: inProps, name: "CcImageSelector" });
	const {
		convertImagesTo,
		downscale,
		name,
		value,
		readOnly,
		capture,
		onChange,
		postEditCallback,
		classes,
		className,
	} = props;
	const variant = props.variant ?? "normal";
	const fileRef = useRef<HTMLInputElement>(null);
	const { t } = useCCTranslations();

	const processFile = useCallback(
		async (file: File) => {
			if (!onChange) return;

			const imageB64 = await fileToData(file);
			let finalImage: string;
			try {
				finalImage = postEditCallback
					? await postEditCallback(imageB64)
					: imageB64;
			} catch (e) {
				// probably user cancel
				// eslint-disable-next-line no-console
				console.error(
					"[Components-Care] [ImageSelector] Post edit callback with error (or cancellation)",
					e,
				);
				return;
			}
			onChange(
				name,
				await processImageB64(
					finalImage,
					convertImagesTo || file.type,
					downscale,
				),
			);
		},
		[onChange, name, postEditCallback, convertImagesTo, downscale],
	);

	const handleFileChange = useCallback(
		async (evt: React.ChangeEvent<HTMLInputElement>) => {
			const elem = evt.currentTarget;
			const file = elem.files && elem.files[0];
			if (!file) return;
			await processFile(file);
		},
		[processFile],
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

	const handleDrop = useCallback(
		async (evt: React.DragEvent<HTMLDivElement>) => {
			if (readOnly) return;

			evt.preventDefault();

			const file = evt.dataTransfer?.files[0];
			if (!file) return;
			await processFile(file);
		},
		[readOnly, processFile],
	);

	const handleDragOver = useCallback(
		(evt: React.DragEvent<HTMLDivElement>) => {
			if (readOnly) return;

			evt.preventDefault();
		},
		[readOnly],
	);

	const [showPreviewDialog, setShowPreviewDialog] = useState(false);
	const handlePreviewDialog = useCallback(() => {
		setShowPreviewDialog(true);
	}, []);
	const handlePreviewDialogClose = useCallback(() => {
		setShowPreviewDialog(false);
	}, []);
	const previewDialog = showPreviewDialog && (
		<Dialog open={true} fullScreen onClose={handlePreviewDialogClose}>
			<PreviewDialogCloseButton onClick={handlePreviewDialogClose}>
				<CloseIcon />
			</PreviewDialogCloseButton>
			<PreviewModern
				src={value}
				alt={props.alt}
				className={classes?.previewModern}
			/>
		</Dialog>
	);

	// render component
	if (variant === "normal") {
		return (
			<GroupBox
				label={props.label}
				smallLabel={props.smallLabel}
				className={className}
			>
				<RootClassic
					container
					spacing={2}
					direction={"column"}
					alignContent={"flex-start"}
					alignItems={"stretch"}
					justifyContent={"center"}
					wrap={"nowrap"}
					className={classes?.rootClassic}
					onDrop={handleDrop}
					onDragOver={handleDragOver}
				>
					{!props.readOnly && (
						<Grid item key={"upload"}>
							<Button
								startIcon={<AttachFile />}
								variant={"contained"}
								color={"primary"}
								name={props.name}
								onClick={handleUpload}
								onBlur={props.onBlur}
							>
								{props.uploadLabel || t("standalone.file-upload.upload")}
							</Button>
							<ChangeEventHelper
								type={"file"}
								accept={"image/*"}
								ref={fileRef}
								onChange={handleFileChange}
								className={classes?.changeEventHelper}
							/>
						</Grid>
					)}
					<ImageWrapper item xs key={"image"} className={classes?.imgWrapper}>
						{value && (
							<PreviewClassic
								src={value}
								alt={props.alt}
								className={classes?.previewClassic}
							/>
						)}
					</ImageWrapper>
				</RootClassic>
			</GroupBox>
		);
	} else if (variant === "modern") {
		return (
			<>
				{previewDialog}
				<GroupBox
					label={props.label}
					smallLabel={props.smallLabel}
					className={className}
				>
					<RootModern
						container
						spacing={0}
						direction={"column"}
						alignContent={"flex-start"}
						alignItems={"stretch"}
						justifyContent={"center"}
						wrap={"nowrap"}
						className={classes?.rootModern}
						onDrop={handleDrop}
						onDragOver={handleDragOver}
					>
						{!props.readOnly && (
							<ChangeEventHelper
								type={"file"}
								accept={"image/*"}
								ref={fileRef}
								onChange={handleFileChange}
								className={classes?.changeEventHelper}
							/>
						)}
						<ImageWrapper
							item
							xs
							key={"image"}
							className={classes?.imgWrapper}
							onBlur={props.onBlur}
							data-name={props.name}
						>
							{value ? (
								<>
									<Tooltip
										title={
											props.uploadLabel ??
											t("standalone.file-upload.upload-modern") ??
											""
										}
									>
										<PreviewModern
											src={value}
											alt={props.alt}
											onClick={handlePreviewDialog}
											className={classes?.previewModern}
										/>
									</Tooltip>
									<ModernUploadControlsWrapper>
										<IconButton onClick={handleUpload}>
											<UploadIcon />
										</IconButton>
									</ModernUploadControlsWrapper>
								</>
							) : (
								<ModernFullHeightBox
									px={2}
									className={classes?.modernFullHeightBox}
								>
									<ModernFullHeightGrid
										container
										onClick={handleUpload}
										direction={"column"}
										spacing={0}
										className={classes?.modernFullHeightGrid}
									>
										<Grid
											item
											xs
											container
											direction={"column"}
											justifyContent={"space-around"}
											wrap={"nowrap"}
										>
											<Grid item>
												<ModernUploadLabel
													component={"h1"}
													variant={"h5"}
													className={classes?.modernUploadLabel}
													align={"center"}
												>
													{props.uploadLabel ??
														t("standalone.file-upload.upload-modern") ??
														""}
												</ModernUploadLabel>
											</Grid>
										</Grid>
										<Grid item>
											<Grid
												container
												wrap={"nowrap"}
												spacing={0}
												justifyContent={"space-between"}
											>
												<Grid item>
													<ModernFormatsLabel
														className={classes?.modernFormatsLabel}
													>
														{props.formatsLabel ??
															t("standalone.file-upload.formats-modern") ??
															""}
													</ModernFormatsLabel>
												</Grid>
												<Grid item>
													<ModernFormatIcon
														className={classes?.modernFormatIcon}
													/>
												</Grid>
											</Grid>
										</Grid>
									</ModernFullHeightGrid>
								</ModernFullHeightBox>
							)}
						</ImageWrapper>
					</RootModern>
				</GroupBox>
			</>
		);
	} else if (variant === "profile_picture") {
		const image = value ? (
			<PfpImage src={value} className={classes?.pfpImg} alt={props.label} />
		) : (
			<PfpImagePlaceholder className={classes?.pfpImgPlaceholder} />
		);

		return (
			<PfpRoot
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				className={combineClassNames([className, classes?.pfpRoot])}
			>
				<ChangeEventHelper
					type={"file"}
					accept={"image/*"}
					ref={fileRef}
					onChange={handleFileChange}
					className={classes?.changeEventHelper}
				/>
				<PfpIconButton
					disabled={props.readOnly}
					onClick={handleUpload}
					className={classes?.pfpIconBtn}
					size="large"
				>
					{image}
				</PfpIconButton>
			</PfpRoot>
		);
	} else {
		throw new Error("Unknown variant");
	}
};

export default React.memo(ImageSelector);
