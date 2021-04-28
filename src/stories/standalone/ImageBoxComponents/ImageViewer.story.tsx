import React from "react";
import { boolean, text, number } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";
import "../../../i18n";
import ImageViewer from "../../../standalone/ImageBoxControl/ImageViewer";

export const ImageViewerStory = (): React.ReactElement => {
	const previewSize = number("Preview size (in px)", 256, {
		range: true,
		min: 16,
		max: 4096,
		step: 16,
	});
	return (
		<div style={{ height: previewSize, width: previewSize }}>
			<ImageViewer
				label={text("Label", "Image Viewer")}
				alt={text("Alt Text", "Alt Description")}
				value={text("Image", "https://via.placeholder.com/128")}
				editLink={text("Edit Link Text", "Edit")}
				showImageBoxDialog={action("openImageDialog")}
				readOnly={boolean("Read-only", false)}
				onFilesDropped={action("onFilesDropped")}
			/>
		</div>
	);
};

ImageViewerStory.storyName = "ImageViewer";
