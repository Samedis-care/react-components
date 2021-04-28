import React from "react";
import { Grid, Link } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import GroupBox from "../../standalone/GroupBox";
import { useDropZone } from "../../utils";
import { UseDropZoneParams } from "../../utils/useDropZone";
export interface ImageViewerProps {
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
	 * The alt text of the image
	 */
	alt: string;
	/**
	 * Is the control read-only?
	 */
	readOnly: boolean;
	/**
	 * Custom styles
	 */
	classes?: Partial<ReturnType<typeof useStyles>>;
	/**
	 * Open image box dialog
	 */
	showImageBoxDialog: () => void;
	/**
	 * Handler for dropped files
	 */
	onFilesDropped: UseDropZoneParams["processFiles"];
}

const useStyles = makeStyles(
	(theme) => ({
		imageViewRoot: {
			height: "100%",
		},
		imgWrapperRoot: {
			maxHeight: "100%",
		},
		noImageBg: {
			width: "100%",
			height: "100%",
			backgroundColor: theme.palette.action.disabledBackground,
		},
		previewRoot: {
			objectFit: "contain",
			display: "block",
			width: "100%",
			height: "100%",
		},
		link: {
			textAlign: "end",
			marginRight: "10px",
		},
		dragging: {
			border: `1px solid ${theme.palette.primary.main}`,
		},
	}),
	{ name: "CcImageViewer" }
);

const ImageBox = (props: ImageViewerProps) => {
	const { value, readOnly, showImageBoxDialog, onFilesDropped } = props;
	const classes = useStyles(props);
	const { handleDragOver, handleDrop, dragging } = useDropZone({
		disabled: readOnly,
		processFiles: onFilesDropped,
	});

	return (
		<GroupBox label={props.label}>
			<Grid
				container
				spacing={0}
				direction={"column"}
				alignContent={"flex-start"}
				alignItems={"stretch"}
				justify={"center"}
				wrap={"nowrap"}
				className={classes.imageViewRoot}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
			>
				<Grid
					item
					xs
					key={"image"}
					className={[
						value ? classes.imgWrapperRoot : classes.noImageBg,
						dragging ? classes.dragging : "",
					].join(" ")}
				>
					{value && (
						<img src={value} alt={props.alt} className={classes.previewRoot} />
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
