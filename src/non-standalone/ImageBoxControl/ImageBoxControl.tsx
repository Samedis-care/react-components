import React, { useState, useCallback } from "react";
import {
	ImageViewer,
	ImageViewerProps,
} from "../../standalone/ImageBoxControl/index";
import { useDialogContext } from "../../framework";
import { showImageDialog } from "../../non-standalone/Dialog";
import {
	IDialogConfigImageBox,
	ImageControllerProps,
} from "../../standalone/ImageBoxControl/index";
export type ImageBoxInputElement = { name: string; value: string };

export interface ImageBoxControlProps
	extends Omit<
			IDialogConfigImageBox,
			"handleChangeAction" | "handlePrimaryAction"
		>,
		Partial<Pick<ImageViewerProps, "value" | "label" | "alt" | "editLink">> {
	/**
	 * Handler for update images
	 */
	onUpdateImages: (values: ImageControllerProps[]) => void;
}

const ImageBoxControl = (props: Omit<ImageBoxControlProps, "classes">) => {
	const {
		value,
		label,
		alt,
		readOnly,
		editLink,
		onUpdateImages,
		...ImageBoxControlProps
	} = props;
	const [pushDialog] = useDialogContext();

	const [uploadedImages, setUploadedImages] = useState<ImageControllerProps[]>(
		[]
	);
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
		(availableImages: ImageControllerProps[]) => {
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
			value={value as string}
			readOnly={readOnly}
			showImageBoxDialog={showImageBoxDialog}
			editLink={editLink}
			label={label}
			alt={alt as string}
		/>
	);
};

export default React.memo(ImageBoxControl);
