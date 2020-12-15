import React from "react";
import { text, withKnobs } from "@storybook/addon-knobs";
import { withActions } from "@storybook/addon-actions";
import TextFieldWithHelp from "../../../standalone/UIKit/TextFieldWithHelp";

export const TextFieldWithHelpStory = (): React.ReactElement => {
	return (
		<TextFieldWithHelp
			label={text("Label", "FieldName")}
			placeholder={text("Placeholder", "Enter something here")}
		/>
	);
};

TextFieldWithHelpStory.storyName = "TextFieldWithHelp";
TextFieldWithHelpStory.decorators = [withActions, withKnobs];
