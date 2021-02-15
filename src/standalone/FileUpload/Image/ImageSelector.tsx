import React, { useCallback, useRef } from "react";
import { Button, Grid } from "@material-ui/core";
import { AttachFile } from "@material-ui/icons";
import i18n from "../../../i18n";
import { processImage } from "../../../utils";
import { IDownscaleProps } from "../../../utils/processImage";
import { makeStyles } from "@material-ui/core/styles";
import GroupBox from "../../GroupBox";

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
		changeEventHelper: {
			display: "none",
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
	const classes = useStyles(props);
	const fileRef = useRef<HTMLInputElement>(null);

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
	return (
		<GroupBox label={props.label}>
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
							{props.uploadLabel || i18n.t("standalone.file-upload.upload")}
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
};

export default React.memo(ImageSelector);
