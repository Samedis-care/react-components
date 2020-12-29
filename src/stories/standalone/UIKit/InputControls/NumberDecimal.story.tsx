import React from "react";
import { boolean, text, withKnobs } from "@storybook/addon-knobs";
import NumberDecimal from "../../../../standalone/UIKit/InputControls/NumberDecimal";

export const NumberDecimalStory = (): React.ReactElement => {
	return (
		<NumberDecimal
			label={text("Label", "FieldName")}
			placeholder={text("Placeholder", "Enter decimal number")}
			fullWidth={boolean("100% Width", true)}
			autoFocus={true}
		/>
	);
};

NumberDecimalStory.storyName = "NumberDecimal";
NumberDecimalStory.decorators = [withKnobs];
NumberDecimalStory.parameters = {
	knobs: {
		escapeHTML: false,
	},
};
