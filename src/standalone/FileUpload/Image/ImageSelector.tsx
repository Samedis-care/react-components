import React, { useCallback, useRef } from "react";
import { Button, Grid, IconButton, Tooltip, useTheme } from "@material-ui/core";
import {
	AttachFile,
	Person,
	SvgIconComponent,
	CloudUploadOutlined,
} from "@material-ui/icons";
import { combineClassNames, processImage } from "../../../utils";
import { IDownscaleProps } from "../../../utils/processImage";
import { makeStyles } from "@material-ui/core/styles";
import GroupBox from "../../GroupBox";
import useCCTranslations from "../../../utils/useCCTranslations";

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
	/**
	 * Upload button for modern variant when no image present
	 * Optional, only used by modern variant. Falls back to CloudUploadOutlined by Material-UI
	 * Can be overwritten via theme
	 */
	placeholderIcon?: SvgIconComponent;
}

const useStyles = makeStyles(
	(theme) => ({
		root: {
			width: `calc(100% - ${theme.spacing(2)}px)`,
			height: `calc(100% - ${theme.spacing(2)}px)`,
			marginTop: theme.spacing(2),
		},
		imgWrapper: {
			maxHeight: "100%",
		},
		preview: {
			objectFit: "contain",
			display: "block",
			width: `calc(100% - ${theme.spacing(2)}px)`,
			height: `calc(100% - ${theme.spacing(2)}px)`,
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
		pfpIconBtnLabel: {
			height: "100%",
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
					justify={"center"}
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
		const Placeholder: SvgIconComponent =
			theme.componentsCare?.fileUpload?.image?.placeholderIcon ??
			props.placeholderIcon ??
			CloudUploadOutlined;

		return (
			<GroupBox label={props.label} smallLabel={props.smallLabel}>
				<Grid
					container
					spacing={2}
					direction={"column"}
					alignContent={"flex-start"}
					alignItems={"stretch"}
					justify={"center"}
					wrap={"nowrap"}
					className={classes.root}
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
							<img
								src={value}
								alt={props.alt}
								onClick={handleUpload}
								className={combineClassNames([
									classes.preview,
									classes.clickablePreview,
								])}
							/>
						) : (
							<Tooltip
								title={
									props.uploadLabel ?? t("standalone.file-upload.upload") ?? ""
								}
							>
								<Placeholder
									onClick={handleUpload}
									className={combineClassNames([
										classes.preview,
										classes.clickablePreview,
									])}
								/>
							</Tooltip>
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
						label: classes.pfpIconBtnLabel,
					}}
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
