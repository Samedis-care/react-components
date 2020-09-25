import React, { useState } from "react";
import "../../../i18n";
import {
	boolean,
	number,
	select,
	text,
	withKnobs,
} from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";
import ImageSelector from "../../../standalone/FileUpload/Image/ImageSelector";

const Settings = {
	title: "Standalone/FileUpload",
	component: ImageSelector,
	decorators: [withKnobs],
};
export default Settings;

export const ImageSelectorStory = (): React.ReactElement => {
	const [image, setImage] = useState("https://via.placeholder.com/128");
	const previewSize = number("Preview size (in px)", 256, {
		range: true,
		min: 16,
		max: 4096,
		step: 16,
	});

	const handleChangeAction = (evt: React.ChangeEvent<HTMLInputElement>) => {
		setImage(evt.target.value);
		action("onChange")(evt.target.name, evt.target.value);
	};

	return (
		<div style={{ height: previewSize, width: previewSize }}>
			<ImageSelector
				name={"story-input"}
				alt={text("Alt Text", "Alt Description")}
				value={image}
				onChange={handleChangeAction}
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
			/>
		</div>
	);
};

ImageSelectorStory.story = {
	name: "ImageSelector",
};
