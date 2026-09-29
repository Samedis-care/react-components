import React from "react";
import { Dialog, IconButton, styled, useThemeProps } from "@mui/material";
import {
	Close as CloseIcon,
	RotateLeft as RotateLeftIcon,
	RotateRight as RotateRightIcon,
} from "@mui/icons-material";
import useImageZoomPan from "../../../utils/useImageZoomPan";
import useCCTranslations from "../../../utils/useCCTranslations";

export interface ImagePreviewDialogProps {
	/**
	 * The image source (data URI or URL)
	 */
	src: string;
	/**
	 * Alt text for the image
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
	 * Custom styles
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

const RotateButtons = styled("div", {
	name: "CcImagePreviewDialog",
	slot: "rotateButtons",
})(({ theme }) => ({
	position: "absolute",
	top: theme.spacing(2),
	left: theme.spacing(2),
	zIndex: 1,
	display: "flex",
}));

const RotateLeftButton = styled(IconButton, {
	name: "CcImagePreviewDialog",
	slot: "rotateLeftButton",
})({});

const RotateRightButton = styled(IconButton, {
	name: "CcImagePreviewDialog",
	slot: "rotateRightButton",
})({});

const Container = styled("div", {
	name: "CcImagePreviewDialog",
	slot: "container",
})({
	width: "100%",
	height: "100%",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	cursor: "grab",
	"&:active": {
		cursor: "grabbing",
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
	| "rotateButtons"
	| "rotateLeftButton"
	| "rotateRightButton"
	| "container"
	| "image";

const ImagePreviewDialog = (inProps: ImagePreviewDialogProps) => {
	const props = useThemeProps({
		props: inProps,
		name: "CcImagePreviewDialog",
	});
	const { src, alt, open, onClose, disableRotation, classes } = props;
	const { t } = useCCTranslations();
	const { imgRef, containerRef, containerProps, rotateLeft, rotateRight } =
		useImageZoomPan(open, src);

	return (
		<Root open={open} fullScreen onClose={onClose} className={classes?.root}>
			<CloseButton
				onClick={onClose}
				aria-label={t("standalone.file-upload.close")}
				className={classes?.closeButton}
			>
				<CloseIcon />
			</CloseButton>
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
			<Container
				ref={containerRef}
				{...containerProps}
				className={classes?.container}
			>
				<PreviewImage
					ref={imgRef}
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
