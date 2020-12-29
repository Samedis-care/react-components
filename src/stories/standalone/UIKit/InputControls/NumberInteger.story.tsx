import React from "react";
import { boolean, text, withKnobs } from "@storybook/addon-knobs";
import NumberInteger from "../../../../standalone/UIKit/InputControls/NumberInteger";

export const NumberIntegerStory = (): React.ReactElement => {
	return (
		<NumberInteger
			label={text("Label", "FieldName")}
			placeholder={text("Placeholder", "Enter integer number")}
			fullWidth={boolean("100% Width", true)}
			autoFocus={true}
		/>
	);
};

NumberIntegerStory.storyName = "NumberInteger";
NumberIntegerStory.decorators = [withKnobs];
NumberIntegerStory.parameters = {
	knobs: {
		escapeHTML: false,
	},
};
