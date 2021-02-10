import React from "react";
import { Grid, Link } from "@material-ui/core";
import { IDownscaleProps } from "../../utils/processImage";
import { makeStyles } from "@material-ui/core/styles";
import GroupBox from "../GroupBox";

import { useDialogContext } from "../../framework";
import { showImageDialog } from "../../non-standalone/Dialog";
export type ImageBoxInputElement = { name: string; value: string };

/**
 * Object properties for image
 */
export interface ImageSelectorBoxProps {
	/**
	 * The base64 string of image
	 */
	src: string;
	/**
	 * Boolean flag to set primary image
	 */
	setPrimary: boolean;
}
export interface ImageBoxProps {
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
	 * The text of the edit link
	 */
	editLink?: string;
	/**
	 * The html for group box
	 */
	infoText?: React.ReactNode;
	/**
	 * The label for group box
	 */
	groupBoxLabel?: string;
	/**
	 * The label for primary button
	 */
	setPrimaryLabel?: string;
	/**
	 * The alt text of the image
	 */
	alt: string;
	/**
	 * The change handler of the input
	 */
	onChange: React.ChangeEventHandler<ImageBoxInputElement>;
	/**
	 * The blur event handler of the input
	 */
	onBlur?: React.FocusEventHandler<HTMLElement>;
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
	 * List of all images
	 */
	uploadedImages: ImageSelectorBoxProps[];
	/**
	 * Handler for setting primary image
	 */
	onPrimarySelected: (values: ImageSelectorBoxProps[]) => void;
	/**
	 * Handler for update images
	 */
	onUpdateImages: (values: ImageSelectorBoxProps[]) => void;
}

const useStyles = makeStyles((theme) => ({
	root: {
		height: "100%",
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
	link: {
		textAlign: "end",
		marginRight: "10px",
	},
}));

const ImageBox = (props: ImageBoxProps) => {
	const { value, readOnly, ...ImageBoxControlProps } = props;
	const classes = useStyles(props);
	const [pushDialog] = useDialogContext();
	const showImageBoxDialog = React.useCallback(() => {
		if (readOnly) return;
		showImageDialog(pushDialog, {
			readOnly,
			...ImageBoxControlProps,
		});
	}, [readOnly, pushDialog, ImageBoxControlProps]);

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
			>
				<Grid item xs key={"image"} className={classes.imgWrapper}>
					{value && (
						<img src={value} alt={props.alt} className={classes.preview} />
					)}
				</Grid>

				{!readOnly && (
					<Link className={classes.link} onClick={showImageBoxDialog}>
						{props.editLink}
					</Link>
				)}
			</Grid>
		</GroupBox>
	);
};

export default React.memo(ImageBox);
