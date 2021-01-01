import React from "react";
import "../../../i18n";
import SignaturePad from "../../../standalone/SignaturePad/index";
import { select, text, withKnobs } from "@storybook/addon-knobs";

export const SignaturePadStory = (): React.ReactElement => {
	const penColor = ["blue", "black", "red", "yellow", "pink"];
	return (
		<SignaturePad
			penColor={select("Pen Color", penColor, "blue")}
			infoText={
				<div
					dangerouslySetInnerHTML={{
						__html: text(
							"Info Text",
							"This is a pretty long info text which supports html. It really is.<br> It explains you what to write in here."
						),
					}}
				/>
			}
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
