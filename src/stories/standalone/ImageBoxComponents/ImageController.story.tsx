import React, { useState, useCallback } from "react";
import { boolean, text, select } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";
import "../../../i18n";
import ImageController, {
	ImageControllerEntry,
} from "../../../standalone/ImageBoxControl/ImageController";

export const ImageControllerStory = (): React.ReactElement => {
	const [uploadedImages, setUploadedImages] = useState<ImageControllerEntry[]>(
		[]
	);
	const infoText = text(
		"Info Text",
		"<ul><li>Click on the icon or drag and drop your picture Drag&Drop your image onto the grey field...</li><li>Select a gallery picture. This will then be displayed in all lists and overviews.</li><li>Your pictures look particularly good when...</li></ul>"
	);
	const updateImages = useCallback(
		(availableImages: ImageControllerEntry[]) => {
			setUploadedImages(availableImages);
			action("onUpdatedImage")("update-images", availableImages);
		},
		[setUploadedImages]
	);
	const capture = select(
		"Capture mode",
		{
			Disabled: "false",
			User: "user",
			Environment: "environment",
		},
		"false"
	);
	return (
		<ImageController
			name={"image-controller"}
			infoText={
				infoText && (
					<div
						dangerouslySetInnerHTML={{
							__html: infoText,
						}}
					/>
				)
			}
			onUpdateImages={updateImages}
			uploadedImages={uploadedImages}
			capture={capture}
			showInfoText={boolean("show-info-text", true)}
			readOnly={boolean("Read-only", false)}
			groupBoxLabel={text("Group box label", "Thats how it work")}
			setPrimaryLabel={text("Primary image label", "Gallery picture")}
		/>
	);
};

ImageControllerStory.storyName = "ImageController";
