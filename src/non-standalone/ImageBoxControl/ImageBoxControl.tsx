import React, { useState, useCallback, useEffect } from "react";
import {
	ImageViewer,
	ImageViewerProps,
} from "../../standalone/ImageBoxControl/index";
import { useDialogContext } from "../../framework";
import { showImageDialog } from "../../non-standalone/Dialog";
import {
	ImageControllerProps,
	ImageControllerEntry,
} from "../../standalone/ImageBoxControl/index";
export type ImageBoxInputElement = { name: string; value: string };

export interface ImageBoxControlProps
	extends Omit<
			ImageControllerProps,
			"handleChangeAction" | "handlePrimaryAction" | "classes"
		>,
		Partial<Pick<ImageViewerProps, "value" | "label" | "alt" | "editLink">> {
	/**
	 * CSS styles to apply
	 */
	classes?: {
		imageViewer?: ImageViewerProps["classes"];
		imageController?: ImageControllerProps["classes"];
	};
	/**
	 * Handler for update images
	 */
	onUpdateImages: (values: ImageControllerEntry[]) => void;
}

const ImageBoxControl = (props: ImageBoxControlProps) => {
	const {
		label,
		alt,
		readOnly,
		editLink,
		onUpdateImages,
		...ImageBoxControlProps
	} = props;
	const [pushDialog] = useDialogContext();

	const [image, setImage] = useState("https://via.placeholder.com/128");
	const [uploadedImages, setUploadedImages] = useState<ImageControllerEntry[]>(
		[]
	);
	useEffect(() => {
		const primaryImage = uploadedImages.find((img) => img.primary);
		setImage(
			primaryImage ? primaryImage.src : "https://via.placeholder.com/128"
		);
	}, [uploadedImages]);
	const handleChangeAction = useCallback(
		(evt: React.ChangeEvent<HTMLInputElement>) => {
			const newUploadedImages = [
				...uploadedImages,
				{ src: evt.target.value, primary: false },
			];
			setUploadedImages(newUploadedImages);
			onUpdateImages(newUploadedImages);
		},
		[uploadedImages, setUploadedImages, onUpdateImages]
	);
	const handlePrimaryAction = useCallback(
		(availableImages: ImageControllerEntry[]) => {
			setUploadedImages(availableImages);
			onUpdateImages(availableImages);
		},
		[setUploadedImages, onUpdateImages]
	);
	const showImageBoxDialog = useCallback(() => {
		if (readOnly) return;
		showImageDialog(pushDialog, {
			readOnly,
			handleChangeAction,
			handlePrimaryAction,
			...ImageBoxControlProps,
		});
	}, [
		readOnly,
		pushDialog,
		handleChangeAction,
		handlePrimaryAction,
		ImageBoxControlProps,
	]);

	// render component
	return (
		<ImageViewer
			value={image}
			readOnly={readOnly}
			showImageBoxDialog={showImageBoxDialog}
			editLink={editLink}
			label={label}
			alt={alt as string}
			classes={props.classes?.imageViewer}
		/>
	);
};

export default React.memo(ImageBoxControl);
