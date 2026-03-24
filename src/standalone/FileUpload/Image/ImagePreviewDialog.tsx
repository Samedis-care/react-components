import React from "react";
import { Dialog, IconButton, styled, useThemeProps } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
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
	| "container"
	| "image";

const ImagePreviewDialog = (inProps: ImagePreviewDialogProps) => {
	const props = useThemeProps({
		props: inProps,
		name: "CcImagePreviewDialog",
	});
	const { src, alt, open, onClose, classes } = props;
	const { t } = useCCTranslations();
	const { imgRef, containerRef, containerProps } = useImageZoomPan(open);

	return (
		<Root open={open} fullScreen onClose={onClose} className={classes?.root}>
			<CloseButton
				onClick={onClose}
				aria-label={t("standalone.file-upload.close")}
				className={classes?.closeButton}
			>
				<CloseIcon />
			</CloseButton>
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
