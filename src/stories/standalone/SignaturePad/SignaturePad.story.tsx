import React from "react";
import "../../../i18n";
import SignaturePad from "../../../standalone/SignaturePad/index";
import { withKnobs } from "@storybook/addon-knobs";

export const SignaturePadStory = (): React.ReactElement => {
	return (
		<SignaturePad
			canvasProps={{
				width: (window.innerWidth * 75) / 100,
				height: 200,
				className: "signCanvas",
			}}
		/>
	);
};

SignaturePadStory.storyName = "SignaturePad";
SignaturePadStory.decorators = [withKnobs];
SignaturePadStory.parameters = {
	knobs: {
		escapeHTML: false,
	},
};
