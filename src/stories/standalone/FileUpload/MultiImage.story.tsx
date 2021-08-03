import React, { useState } from "react";
import "../../../i18n";
import { text, boolean, number, select } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";
import MultiImage, {
	MultiImageImage,
} from "../../../standalone/FileUpload/MultiImage/MultiImage";
import { HowToBox } from "../../../standalone";

// need to inline it due to jest not supporting file imports
const placeholder =
	"data:image/png;base64,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";

export const MultiImageStory = (): React.ReactElement => {
	const noData = boolean("No data", false);
	const [images, setImages] = useState<MultiImageImage[]>(
		noData
			? []
			: [
					{
						id: "image-1",
						image: "https://via.placeholder.com/128",
						name: "128.png",
					},
					{
						id: "image-2",
						image: "https://via.placeholder.com/128x256",
						name: "128x256.png",
					},
					{
						id: "image-3",
						image: "https://via.placeholder.com/256x128",
						name: "256x128.png",
					},
			  ]
	);
	const [primary, setPrimary] = useState<string | null>(images[0]?.id ?? null);
	const previewSize = number("Preview size (in px)", 256, {
		range: true,
		min: 128,
		max: 512,
		step: 16,
	});

	const handleChange = (name: string | undefined, value: MultiImageImage[]) => {
		setImages(value);
		action("onChange")(name, value);
	};

	const handlePrimaryChange = (name: string | undefined, id: string | null) => {
		setPrimary(id);
		action("onPrimaryChange")(name, id);
	};

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
		<div style={{ width: 400, height: 400 }}>
			<MultiImage
				label={text("Label", "Multi Image Input")}
				images={images}
				primary={primary}
				onChange={handleChange}
				onPrimaryChange={handlePrimaryChange}
				previewSize={previewSize}
				uploadImage={placeholder}
				capture={capture}
				additionalDialogContent={[
					<div key={"howto"}>
						<HowToBox
							labels={
								boolean("Long Help Text?", false)
									? [
											"Vivamus ac ante scelerisque, tincidunt lacus at, porttitor neque. Nunc turpis ante, dictum eu quam a, ultricies ultricies massa. Nam eu odio vel nisi faucibus fringilla dictum non odio. Quisque ullamcorper lorem vel sem porttitor, vitae congue libero dictum. Donec vel interdum orci. Nullam sed elit commodo, condimentum arcu ac, dapibus metus. Quisque dapibus ante eget erat suscipit varius. Nulla facilisi.",
											"Pellentesque dapibus nibh mattis massa faucibus, quis malesuada purus dictum. Sed quis posuere massa. Nunc in rhoncus ligula. Fusce eget dictum massa, a venenatis dui. Maecenas ac mauris id velit finibus condimentum. Vivamus lacinia ut augue ac posuere. Nullam accumsan lorem id pulvinar posuere. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Vivamus eget diam vitae ipsum iaculis efficitur nec sed orci. Cras ut tristique metus. In consectetur dui vitae odio tincidunt, vitae suscipit orci pretium.",
											"Morbi tortor quam, aliquet quis porta eget, pulvinar quis turpis. Phasellus nec egestas arcu, ac auctor sapien. Aliquam facilisis vulputate tortor et rutrum. In congue arcu nec ipsum maximus, eu efficitur arcu ultrices. Aliquam id orci quis felis tempor porttitor. Nullam gravida eget purus ut cursus. Cras ornare lorem lectus, et semper nulla porta at. Quisque sed nulla et erat convallis pharetra a nec nulla. Morbi molestie enim mollis ultricies tempus.",
											"Pellentesque feugiat neque mi, id sagittis enim accumsan sit amet. Interdum et malesuada fames ac ante ipsum primis in faucibus. Suspendisse pretium ante ut diam blandit aliquam. Vestibulum aliquet elementum quam et porttitor. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc malesuada cursus gravida. Nunc id euismod diam. Sed viverra tristique felis, sed feugiat ex facilisis sit amet. Praesent sed tempus massa, ac fermentum nisl. Vestibulum vitae arcu aliquet, eleifend metus ac, mollis purus.",
									  ]
									: ["Step 1", "Step 2", "Step 3", "Step 4"]
							}
						/>
					</div>,
				]}
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

MultiImageStory.storyName = "MultiImageSelector";
