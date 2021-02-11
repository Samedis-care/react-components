import React, { useState } from "react";
import "../../../i18n";
import { boolean, number, select, text } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";
import ImageBoxControl from "../../../non-standalone/ImageBoxControl/ImageBoxControl";
import { ImageControllerEntry } from "../../../standalone/ImageBoxControl/index";

export const ImageBoxStory = (): React.ReactElement => {
	const [image, setImage] = useState("https://via.placeholder.com/128");
	const [uploadedImages, setUploadedImages] = useState<ImageControllerEntry[]>(
		[]
	);
	const previewSize = number("Preview size (in px)", 256, {
		range: true,
		min: 16,
		max: 4096,
		step: 16,
	});
	const infoText = text(
		"Info Text",
		"<ul><li>Click on the icon or drag and drop your picture Drag&Drop your image onto the grey field...</li><li>Select a gallery picture. This will then be displayed in all lists and overviews.</li><li>Your pictures look particularly good when...</li></ul>"
	);
	const updateImages = (availableImages: ImageControllerEntry[]) => {
		const filtered = availableImages.filter((image) => {
			return image.primary;
		});
		if (filtered.length > 0) {
			availableImages.map((image) => {
				if (image.primary) {
					setImage(image.src);
				}
			});
		} else {
			setImage("https://via.placeholder.com/128");
		}
		setUploadedImages(availableImages);
		action("onUpdatedImage")("update-images", availableImages);
	};
	return (
		<div style={{ height: previewSize, width: previewSize }}>
			<ImageBoxControl
				name={"story-image-box"}
				label={text("Label", "Image Box Control")}
				alt={text("Alt Text", "Alt Description")}
				value={image}
				onUpdateImages={updateImages}
				uploadedImages={uploadedImages}
				convertImagesTo={select(
					"Convert Images to",
					{
						"Don't convert": "",
						".png": "image/png",
						".jpg": "image/jpg",
					},
					""
				)}
				downscale={
					boolean("Enable downscaling?", false)
						? {
								width: number("Max width", 1920, {
									range: true,
									min: 16,
									max: 4096,
									step: 16,
								}),
								height: number("Max height", 1080, {
									range: true,
									min: 16,
									max: 4096,
									step: 16,
								}),
								keepRatio: boolean("Keep aspect ratio when scaling", true),
						  }
						: undefined
				}
				readOnly={boolean("Read-only", false)}
				editLink={text("Edit Link Text", "Edit")}
				infoText={
					infoText && (
						<div
							dangerouslySetInnerHTML={{
								__html: infoText,
							}}
						/>
					)
				}
				showInfoText={boolean("show-info-text", true)}
				groupBoxLabel={text("Group box label", "Thats how it work")}
				setPrimaryLabel={text("Primary image label", "Gallery picture")}
			/>
		</div>
	);
};

ImageBoxStory.storyName = "ImageBox";
