import React, { useState } from "react";
import "../../../i18n";
import { boolean, number, select, text } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";
import ImageBox from "../../../standalone/ImageBoxControl/ImageBox";

/**
 * Object properties for image
 */
export interface ImageSelectorBoxProps {
	/**
	 * The base64 string of image
	 */
	src: string;
	/**
	 * Boolean flag to set primary image
	 */
	setPrimary: boolean;
}
export const ImageBoxStory = (): React.ReactElement => {
	const [image, setImage] = useState("https://via.placeholder.com/128");
	const [uploadedImages, setUploadedImages] = useState<ImageSelectorBoxProps[]>(
		[]
	);
	const previewSize = number("Preview size (in px)", 256, {
		range: true,
		min: 16,
		max: 4096,
		step: 16,
	});
	const handleChangeAction = (evt: React.ChangeEvent<HTMLInputElement>) => {
		const newUploadedImages = [
			...uploadedImages,
			{ src: evt.target.value, setPrimary: false },
		];
		setUploadedImages(newUploadedImages);
		action("onChange")(evt.target.name, evt.target.value);
	};
	const handlePrimaryAction = (availableImages: ImageSelectorBoxProps[]) => {
		setUploadedImages(availableImages);
		const filtered = availableImages.filter((image) => {
			return image.setPrimary;
		});
		if (filtered.length > 0) {
			availableImages.map((image) => {
				if (image.setPrimary) {
					setImage(image.src);
					action("onPrimarySelected")("", image.src);
				}
			});
		} else {
			setImage("https://via.placeholder.com/128");
			action("onPrimarySelected")("", "https://via.placeholder.com/128");
		}
	};
	const updateImages = (availableImages: ImageSelectorBoxProps[]) => {
		setUploadedImages(availableImages);
		action("onUpdatedImage")("", availableImages);
	};
	return (
		<div style={{ height: previewSize, width: previewSize }}>
			<ImageBox
				name={"story-input"}
				label={text("Label", "Image Box Control")}
				alt={text("Alt Text", "Alt Description")}
				value={image}
				onChange={handleChangeAction}
				onPrimarySelected={handlePrimaryAction}
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
			/>
		</div>
	);
};

ImageBoxStory.storyName = "ImageBox";
