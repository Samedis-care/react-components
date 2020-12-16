import React from "react";
import { boolean, text, withKnobs } from "@storybook/addon-knobs";
import TextFieldWithHelp from "../../../standalone/UIKit/TextFieldWithHelp";

export const TextFieldWithHelpStory = (): React.ReactElement => {
	return (
		<TextFieldWithHelp
			label={text("Label", "FieldName")}
			placeholder={text("Placeholder", "Enter something here")}
			fullWidth={boolean("100% Width", true)}
			important={boolean("Important", false)}
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

TextFieldWithHelpStory.storyName = "TextFieldWithHelp";
TextFieldWithHelpStory.decorators = [withKnobs];
TextFieldWithHelpStory.parameters = {
	knobs: {
		escapeHTML: false,
	},
};
