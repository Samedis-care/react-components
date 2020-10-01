import React, { useCallback, useRef } from "react";
import { Button, Grid } from "@material-ui/core";
import { AttachFile } from "@material-ui/icons";
import i18n from "../../../i18n";
import { processImage } from "../../../utils";
import { IDownscaleProps } from "../../../utils/processImage";
import { makeStyles } from "@material-ui/core/styles";
import GroupBox from "../../GroupBox";

export type ImageSelectorInputElement = { name: string; value: string };

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
	 * The label of the input
	 */
	label?: string;
	/**
	 * The alt text of the image
	 */
	alt: string;
	/**
	 * The change handler of the input
	 */
	onChange?: React.ChangeEventHandler<ImageSelectorInputElement>;
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
}

const useStyles = makeStyles({
	preview: {
		width: "100%",
		height: "100%",
	},
	changeEventHelper: {
		display: "none",
	},
});

const ImageSelector = (props: ImageSelectorProps) => {
	const { convertImagesTo, downscale, value, readOnly } = props;
	const classes = useStyles();
	const changeRef = useRef<HTMLInputElement>(null);

	const processFile = useCallback(
		async (file: File) => {
			if (!changeRef.current) return;

			const value = await processImage(file, convertImagesTo, downscale);

			// eslint-disable-next-line @typescript-eslint/unbound-method
			const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
				window.HTMLInputElement.prototype,
				"value"
			)?.set;
			nativeInputValueSetter?.call(changeRef.current, value);

			const event = new Event("input", { bubbles: true });
			changeRef.current.dispatchEvent(event);
		},
		[convertImagesTo, downscale]
	);

	// upload click handler
	const handleUpload = useCallback(() => {
		const elem = document.createElement("input");
		elem.type = "file";
		elem.accept = "image/*";
		elem.multiple = false;
		elem.addEventListener("change", () => {
			const files = elem.files;
			if (!files) return;
			const file = files[0];
			if (!file) return;
			void processFile(file);
		});
		elem.click();
	}, [processFile]);

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
				alignContent={"space-between"}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
			>
				{!props.readOnly && (
					<Grid item xs key={"upload"}>
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
							type={"text"}
							name={props.name}
							onChange={props.onChange}
							ref={changeRef}
							className={classes.changeEventHelper}
						/>
					</Grid>
				)}
				<Grid item xs={12} key={"image"}>
					{value && (
						<img src={value} alt={props.alt} className={classes.preview} />
					)}
				</Grid>
			</Grid>
		</GroupBox>
	);
};

export default React.memo(ImageSelector);
