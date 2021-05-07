import React, { CSSProperties, useCallback, useState } from "react";
import { UseDropZoneParams } from "../../../utils/useDropZone";
import { makeStyles } from "@material-ui/core/styles";
import { Dialog, DialogContent, IconButton, Theme } from "@material-ui/core";
import {
	Close as CloseIcon,
	ArrowBack as PrevIcon,
	ArrowForward as NextIcon,
	Delete as DeleteIcon,
} from "@material-ui/icons";
import {
	combineClassNames,
	makeThemeStyles,
	useDropZone,
} from "../../../utils";
import { ClassNameMap, Styles } from "@material-ui/styles/withStyles";

export interface ImageBoxProps {
	/**
	 * The Image to display (URL/Data-URI)
	 */
	image: string;
	/**
	 * The width of the preview
	 */
	width?: CSSProperties["width"];
	/**
	 * The height of the preview
	 */
	height?: CSSProperties["height"];
	/**
	 * The custom onClick handler.
	 * If not set a fullscreen preview will be opened
	 * If set the onClick handler will be called
	 * If set to null explicitly no action will be performed and the cursor won't show clickable
	 */
	onClick?: React.MouseEventHandler | null;
	/**
	 * File drop handler
	 */
	onFilesDropped?: UseDropZoneParams;
	/**
	 * Remove handler. Optional, will show remove icon if set
	 */
	onRemove?: () => void;
	/**
	 * Goto next image. Optional, will show next arrow if set
	 */
	onNextImage?: () => void;
	/**
	 * Goto prev image. Optional, will show go back arrow if set
	 */
	onPrevImage?: () => void;
	/**
	 * Custom CSS styles
	 */
	classes?: ClassNameMap<keyof ReturnType<typeof useStyles>>;
}

const useStyles = makeStyles(
	(theme) => ({
		root: {
			backgroundColor: theme.palette.secondary.light,
			borderRadius: 8,
			position: "relative",
			height: "100%",
			"& button": {
				visibility: "hidden",
				opacity: 0,
				transition: "visibility 0s linear 300ms, opacity 300ms",
			},
			"&:hover button": {
				visibility: "visible",
				opacity: 1,
				transition: "visibility 0s linear 0s, opacity 300ms",
			},
		},
		clickable: {
			cursor: "pointer",
		},
		dragging: {
			border: `1px solid ${theme.palette.primary.main}`,
		},
		fullScreenImageWrapper: {
			width: "100%",
			height: "100%",
			position: "relative",
		},
		image: {
			width: "100%",
			height: "100%",
			objectFit: "contain",
			borderRadius: 8,
		},
		removeBtn: {
			padding: theme.spacing(1),
			position: "absolute",
			top: 0,
			right: 0,
		},
		prevBtn: {
			position: "absolute",
			top: "50%",
			left: 0,
			transform: "translateY(-50%)",
		},
		nextBtn: {
			position: "absolute",
			top: "50%",
			right: 0,
			transform: "translateY(-50%)",
		},
	}),
	{ name: "CcImageBox" }
);

export type ImageBoxClassKey = keyof ReturnType<typeof useStyles>;

export type ImageBoxTheme = Partial<
	Styles<Theme, ImageBoxProps, ImageBoxClassKey>
>;

const useThemeStyles = makeThemeStyles<ImageBoxProps, ImageBoxClassKey>(
	(theme) => theme.componentsCare?.fileUpload?.multiImage?.imageBox,
	"CcImageBox",
	useStyles
);

const ImageBox = (props: ImageBoxProps) => {
	const {
		image,
		width,
		height,
		onClick,
		onFilesDropped,
		onRemove,
		onNextImage,
		onPrevImage,
	} = props;
	const classes = useThemeStyles(props);
	const { handleDragOver, handleDrop, dragging } = useDropZone(onFilesDropped);
	const [dialogOpen, setDialogOpen] = useState(false);

	const openDialog = useCallback(() => {
		setDialogOpen(true);
	}, []);
	const closeDialog = useCallback(() => {
		setDialogOpen(false);
	}, []);
	const handleRemove = useCallback(
		(evt: React.MouseEvent) => {
			evt.stopPropagation();
			if (onRemove) onRemove();
		},
		[onRemove]
	);
	const handlePrevImage = useCallback(
		(evt: React.MouseEvent) => {
			evt.stopPropagation();
			if (onPrevImage) onPrevImage();
		},
		[onPrevImage]
	);
	const handleNextImage = useCallback(
		(evt: React.MouseEvent) => {
			evt.stopPropagation();
			if (onNextImage) onNextImage();
		},
		[onNextImage]
	);

	return (
		<>
			<div
				onClick={onClick === null ? undefined : onClick ?? openDialog}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
				style={{ width, height }}
				className={combineClassNames([
					classes.root,
					dragging && classes.dragging,
					onClick !== null && classes.clickable,
				])}
			>
				{onRemove && (
					<IconButton onClick={handleRemove} className={classes.removeBtn}>
						<DeleteIcon />
					</IconButton>
				)}
				{onPrevImage && (
					<IconButton onClick={handlePrevImage} className={classes.prevBtn}>
						<PrevIcon />
					</IconButton>
				)}
				{onNextImage && (
					<IconButton onClick={handleNextImage} className={classes.nextBtn}>
						<NextIcon />
					</IconButton>
				)}
				<img src={image} alt={""} className={classes.image} />
			</div>
			{!onClick && (
				<Dialog open={dialogOpen} fullScreen onClose={closeDialog}>
					<DialogContent>
						<div className={classes.fullScreenImageWrapper}>
							<IconButton onClick={closeDialog} className={classes.removeBtn}>
								<CloseIcon />
							</IconButton>
							{onPrevImage && (
								<IconButton
									onClick={handlePrevImage}
									className={classes.prevBtn}
								>
									<PrevIcon />
								</IconButton>
							)}
							{onNextImage && (
								<IconButton
									onClick={handleNextImage}
									className={classes.nextBtn}
								>
									<NextIcon />
								</IconButton>
							)}
							<img src={image} alt={""} className={classes.image} />
						</div>
					</DialogContent>
				</Dialog>
			)}
		</>
	);
};

export default React.memo(ImageBox);
