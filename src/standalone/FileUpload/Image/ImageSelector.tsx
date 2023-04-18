import React, { useCallback, useRef } from "react";
import {
	Box,
	Button,
	Grid,
	IconButton,
	Tooltip,
	Typography,
	useTheme,
} from "@mui/material";
import { AttachFile, Person } from "@mui/icons-material";
import { combineClassNames, processImage } from "../../../utils";
import { IDownscaleProps } from "../../../utils/processImage";
import makeStyles from "@mui/styles/makeStyles";
import GroupBox from "../../GroupBox";
import useCCTranslations from "../../../utils/useCCTranslations";
import { ImageFileIcon } from "../FileIcons";

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
	 * Custom styles
	 */
	classes?: Partial<ReturnType<typeof useStyles>>;
	/**
	 * The display variant
	 * @default normal (overridable by theme)
	 */
	variant?: "normal" | "modern" | "profile_picture";
}

const useStyles = makeStyles(
	(theme) => ({
		root: {
			width: `calc(100% - ${theme.spacing(2)})`,
			height: `calc(100% - ${theme.spacing(2)})`,
			marginTop: theme.spacing(2),
		},
		rootModern: {
			cursor: "pointer",
			height: "100%",
		},
		imgWrapper: {
			maxHeight: "100%",
		},
		preview: {
			objectFit: "contain",
			display: "block",
			width: `calc(100% - ${theme.spacing(2)})`,
			height: `calc(100% - ${theme.spacing(2)})`,
		},
		previewModern: {
			objectFit: "contain",
			display: "block",
			width: "100%",
			height: "100%",
		},
		modernUploadLabel: {
			color: theme.palette.action.disabled,
		},
		modernFormatsLabel: {
			color: theme.palette.action.disabled,
		},
		modernFormatIcon: {
			color: theme.palette.action.disabled,
		},
		modernFullHeight: {
			height: "100%",
		},
		clickablePreview: {
			cursor: "pointer",
		},
		changeEventHelper: {
			display: "none",
		},
		pfpRoot: {
			height: "100%",
		},
		pfpIconBtn: {
			width: "100%",
			height: "100%",
			margin: 2, // borderSize in pfpImg * 2
			padding: 0,
		},
		pfpImg: {
			width: "100%",
			height: "100%",
			border: `1px lightgray solid`,
			borderRadius: "50%",
			boxShadow: theme.shadows[4],
			textOverflow: "ellipsis",
			overflow: "hidden",
			display: "flex",
			alignItems: "center",
		},
	}),
	{ name: "CcImageSelector" }
);

const ImageSelector = (props: ImageSelectorProps) => {
	const {
		convertImagesTo,
		downscale,
		name,
		value,
		readOnly,
		capture,
		onChange,
	} = props;
	const theme = useTheme();
	const variant =
		props.variant ??
		theme.componentsCare?.fileUpload?.image?.defaultVariant ??
		"normal";
	const classes = useStyles(props);
	const fileRef = useRef<HTMLInputElement>(null);
	const { t } = useCCTranslations();

	const processFile = useCallback(
		async (file: File) => {
			if (!onChange) return;

			onChange(name, await processImage(file, convertImagesTo, downscale));
		},
		[name, onChange, convertImagesTo, downscale]
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
		[readOnly, processFile]
	);

	const handleDragOver = useCallback(
		(evt: React.DragEvent<HTMLDivElement>) => {
			if (readOnly) return;

			evt.preventDefault();
		},
		[readOnly]
	);

	// render component
	if (variant === "normal") {
		return (
			<GroupBox label={props.label} smallLabel={props.smallLabel}>
				<Grid
					container
					spacing={2}
					direction={"column"}
					alignContent={"flex-start"}
					alignItems={"stretch"}
					justifyContent={"center"}
					wrap={"nowrap"}
					className={classes.root}
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
							<input
								type={"file"}
								accept={"image/*"}
								ref={fileRef}
								onChange={handleFileChange}
								className={classes.changeEventHelper}
							/>
						</Grid>
					)}
					<Grid item xs key={"image"} className={classes.imgWrapper}>
						{value && (
							<img src={value} alt={props.alt} className={classes.preview} />
						)}
					</Grid>
				</Grid>
			</GroupBox>
		);
	} else if (variant === "modern") {
		return (
			<GroupBox label={props.label} smallLabel={props.smallLabel}>
				<Grid
					container
					spacing={0}
					direction={"column"}
					alignContent={"flex-start"}
					alignItems={"stretch"}
					justifyContent={"center"}
					wrap={"nowrap"}
					className={classes.rootModern}
					onDrop={handleDrop}
					onDragOver={handleDragOver}
				>
					{!props.readOnly && (
						<input
							type={"file"}
							accept={"image/*"}
							ref={fileRef}
							onChange={handleFileChange}
							className={classes.changeEventHelper}
						/>
					)}
					<Grid
						item
						xs
						key={"image"}
						className={classes.imgWrapper}
						onBlur={props.onBlur}
						data-name={props.name}
					>
						{value ? (
							<Tooltip
								title={
									props.uploadLabel ??
									t("standalone.file-upload.upload-modern") ??
									""
								}
							>
								<img
									src={value}
									alt={props.alt}
									onClick={handleUpload}
									className={combineClassNames([
										classes.previewModern,
										classes.clickablePreview,
									])}
								/>
							</Tooltip>
						) : (
							<Box px={2} className={classes.modernFullHeight}>
								<Grid
									container
									onClick={handleUpload}
									direction={"column"}
									spacing={0}
									className={classes.modernFullHeight}
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
											<Typography
												component={"h1"}
												variant={"h5"}
												className={classes.modernUploadLabel}
												align={"center"}
											>
												{props.uploadLabel ??
													t("standalone.file-upload.upload-modern") ??
													""}
											</Typography>
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
												<Typography className={classes.modernFormatsLabel}>
													{props.formatsLabel ??
														t("standalone.file-upload.formats-modern") ??
														""}
												</Typography>
											</Grid>
											<Grid item>
												<ImageFileIcon className={classes.modernFormatIcon} />
											</Grid>
										</Grid>
									</Grid>
								</Grid>
							</Box>
						)}
					</Grid>
				</Grid>
			</GroupBox>
		);
	} else if (variant === "profile_picture") {
		const image = value ? (
			<img src={value} className={classes.pfpImg} alt={props.label} />
		) : (
			<Person className={classes.pfpImg} />
		);

		return (
			<div
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				className={classes.pfpRoot}
			>
				<input
					type={"file"}
					accept={"image/*"}
					ref={fileRef}
					onChange={handleFileChange}
					className={classes.changeEventHelper}
				/>
				<IconButton
					disabled={props.readOnly}
					onClick={handleUpload}
					classes={{
						root: classes.pfpIconBtn,
					}}
					size="large"
				>
					{image}
				</IconButton>
			</div>
		);
	} else {
		throw new Error("Unknown variant");
	}
};

export default React.memo(ImageSelector);
