import React, { useId } from "react";
import { Dialog, IconButton, styled, useThemeProps } from "@mui/material";
import {
	Close as CloseIcon,
	FitScreenOutlined as ResetZoomIcon,
	RotateLeft as RotateLeftIcon,
	RotateRight as RotateRightIcon,
	ZoomIn as ZoomInIcon,
	ZoomOut as ZoomOutIcon,
} from "@mui/icons-material";
import useImageZoomPan from "../../../utils/useImageZoomPan";
import useCCTranslations from "../../../utils/useCCTranslations";
import combineClassNames from "../../../utils/combineClassNames";

export interface ImagePreviewDialogProps {
	/**
	 * The image source (data URI or URL)
	 */
	src: string;
	/**
	 * Alt text for the image
	 * @remarks Also the dialog's accessible name (the dialog is labelled by the image), so a
	 *          screen reader announces it when the dialog opens. Should not be empty.
	 */
	alt: string;
	/**
	 * Whether the dialog is open
	 */
	open: boolean;
	/**
	 * Called when the dialog should close
	 */
	onClose: () => void;
	/**
	 * Hide the rotate buttons
	 */
	disableRotation?: boolean;
	/**
	 * Custom styles. `toolbar` holds the rotate buttons (`rotateButtons`) and the zoom
	 * buttons (`zoomButtons`) in the top left corner. While the image is zoomed in,
	 * `container` also carries the class `CcImagePreviewDialog-zoomed` (and shows the grab
	 * cursor).
	 */
	classes?: Partial<Record<ImagePreviewDialogClassKey, string>>;
}

const Root = styled(Dialog, {
	name: "CcImagePreviewDialog",
	slot: "root",
})({});

const CloseButton = styled(IconButton, {
	name: "CcImagePreviewDialog",
	slot: "closeButton",
})(({ theme }) => ({
	position: "absolute",
	top: theme.spacing(2),
	right: theme.spacing(2),
	zIndex: 1,
}));

const Toolbar = styled("div", {
	name: "CcImagePreviewDialog",
	slot: "toolbar",
})(({ theme }) => ({
	position: "absolute",
	top: theme.spacing(2),
	left: theme.spacing(2),
	zIndex: 1,
	display: "flex",
}));

const RotateButtons = styled("div", {
	name: "CcImagePreviewDialog",
	slot: "rotateButtons",
})({
	display: "flex",
});

const RotateLeftButton = styled(IconButton, {
	name: "CcImagePreviewDialog",
	slot: "rotateLeftButton",
})({});

const RotateRightButton = styled(IconButton, {
	name: "CcImagePreviewDialog",
	slot: "rotateRightButton",
})({});

const ZoomButtons = styled("div", {
	name: "CcImagePreviewDialog",
	slot: "zoomButtons",
})({
	display: "flex",
});

const ZoomInButton = styled(IconButton, {
	name: "CcImagePreviewDialog",
	slot: "zoomInButton",
})({});

const ZoomOutButton = styled(IconButton, {
	name: "CcImagePreviewDialog",
	slot: "zoomOutButton",
})({});

const ResetZoomButton = styled(IconButton, {
	name: "CcImagePreviewDialog",
	slot: "resetZoomButton",
})({});

/**
 * State class of the container: the image is zoomed in, so dragging pans it
 */
const containerClasses = {
	zoomed: "CcImagePreviewDialog-zoomed",
};

const Container = styled("div", {
	name: "CcImagePreviewDialog",
	slot: "container",
})({
	width: "100%",
	height: "100%",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	[`&.${containerClasses.zoomed}`]: {
		cursor: "grab",
		"&:active": {
			cursor: "grabbing",
		},
	},
});

const PreviewImage = styled("img", {
	name: "CcImagePreviewDialog",
	slot: "image",
})({
	objectFit: "contain",
	display: "block",
	width: "100%",
	height: "100%",
	pointerEvents: "none",
	userSelect: "none",
});

export type ImagePreviewDialogClassKey =
	| "root"
	| "closeButton"
	| "toolbar"
	| "rotateButtons"
	| "rotateLeftButton"
	| "rotateRightButton"
	| "zoomButtons"
	| "zoomInButton"
	| "zoomOutButton"
	| "resetZoomButton"
	| "container"
	| "image";

/**
 * A full-screen preview of an image. It zooms by wheel, pinch, double-click, the zoom
 * buttons and the keys `+`, `-` and `0`; while zoomed in it pans by dragging and by the
 * arrow keys; and it turns by the rotate buttons. The keys work wherever the focus is in
 * the dialog.
 */
const ImagePreviewDialog = (inProps: ImagePreviewDialogProps) => {
	const props = useThemeProps({
		props: inProps,
		name: "CcImagePreviewDialog",
	});
	const { src, alt, open, onClose, disableRotation, classes } = props;
	const { t } = useCCTranslations();
	const {
		imgRef,
		containerRef,
		containerProps,
		rotateLeft,
		rotateRight,
		zoomIn,
		zoomOut,
		resetZoom,
		zoomed,
		handleKeyDown,
	} = useImageZoomPan(open, src);
	// the dialog is named by the image's alt: without a DialogTitle, MUI's own aria-labelledby
	// would point at an id no element carries
	const imageId = useId();

	return (
		<Root
			open={open}
			fullScreen
			onClose={onClose}
			onKeyDown={handleKeyDown}
			aria-labelledby={imageId}
			className={classes?.root}
		>
			<CloseButton
				onClick={onClose}
				aria-label={t("standalone.file-upload.close")}
				className={classes?.closeButton}
			>
				<CloseIcon />
			</CloseButton>
			<Toolbar className={classes?.toolbar}>
				{!disableRotation && (
					<RotateButtons className={classes?.rotateButtons}>
						<RotateLeftButton
							onClick={rotateLeft}
							aria-label={t("standalone.file-upload.rotate-left")}
							className={classes?.rotateLeftButton}
						>
							<RotateLeftIcon />
						</RotateLeftButton>
						<RotateRightButton
							onClick={rotateRight}
							aria-label={t("standalone.file-upload.rotate-right")}
							className={classes?.rotateRightButton}
						>
							<RotateRightIcon />
						</RotateRightButton>
					</RotateButtons>
				)}
				<ZoomButtons className={classes?.zoomButtons}>
					<ZoomInButton
						onClick={zoomIn}
						aria-label={t("standalone.file-upload.zoom-in")}
						className={classes?.zoomInButton}
					>
						<ZoomInIcon />
					</ZoomInButton>
					<ZoomOutButton
						onClick={zoomOut}
						aria-label={t("standalone.file-upload.zoom-out")}
						className={classes?.zoomOutButton}
					>
						<ZoomOutIcon />
					</ZoomOutButton>
					<ResetZoomButton
						onClick={resetZoom}
						aria-label={t("standalone.file-upload.reset-zoom")}
						className={classes?.resetZoomButton}
					>
						<ResetZoomIcon />
					</ResetZoomButton>
				</ZoomButtons>
			</Toolbar>
			<Container
				ref={containerRef}
				{...containerProps}
				className={combineClassNames([
					classes?.container,
					zoomed && containerClasses.zoomed,
				])}
			>
				<PreviewImage
					ref={imgRef}
					id={imageId}
					src={src}
					alt={alt}
					className={classes?.image}
					draggable={false}
				/>
			</Container>
		</Root>
	);
};

export default React.memo(ImagePreviewDialog);
