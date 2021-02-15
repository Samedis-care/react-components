import React, { useState, useCallback, useEffect } from "react";
import {
	ImageViewer,
	ImageViewerProps,
} from "../../standalone/ImageBoxControl/index";
import { useDialogContext } from "../../framework";
import { showImageDialog } from "../../non-standalone/Dialog";
import { ImageControllerProps } from "../../standalone/ImageBoxControl/index";
export type ImageBoxInputElement = { name: string; value: string };

export interface ImageBoxControlProps
	extends Omit<ImageControllerProps, "classes">,
		Partial<Pick<ImageViewerProps, "value" | "label" | "alt" | "editLink">> {
	/**
	 * CSS styles to apply
	 */
	subClasses?: {
		imageViewer?: ImageViewerProps["classes"];
		imageController?: ImageControllerProps["classes"];
	};
	/**
	 * The primary image value
	 */
	primaryImage?: string;
}

const ImageBoxControl = (props: ImageBoxControlProps) => {
	const {
		label,
		alt,
		readOnly,
		editLink,
		primaryImage,
		uploadedImages,
		onUpdateImages,
		...ImageBoxControlProps
	} = props;
	const [pushDialog] = useDialogContext();
	const [image, setImage] = useState(primaryImage);
	useEffect(() => {
		const primaryImg = uploadedImages.find((img) => img.primary);
		setImage(primaryImg ? primaryImg.src : primaryImage);
	}, [uploadedImages, primaryImage]);

	const showImageBoxDialog = useCallback(() => {
		showImageDialog(pushDialog, {
			readOnly,
			uploadedImages,
			onUpdateImages,
			...ImageBoxControlProps,
		});
	}, [
		readOnly,
		uploadedImages,
		onUpdateImages,
		pushDialog,
		ImageBoxControlProps,
	]);
	// render component
	return (
		<ImageViewer
			value={image as string}
			readOnly={readOnly}
			showImageBoxDialog={showImageBoxDialog}
			editLink={editLink}
			label={label}
			alt={alt as string}
			classes={props.subClasses?.imageViewer}
		/>
	);
};

export default React.memo(ImageBoxControl);
