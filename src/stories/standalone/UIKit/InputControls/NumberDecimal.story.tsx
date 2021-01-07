import React, { useState } from "react";
import { boolean, text, withKnobs } from "@storybook/addon-knobs";
import NumberDecimal from "../../../../standalone/UIKit/InputControls/NumberDecimal";
import { action, withActions } from "@storybook/addon-actions";

export const NumberDecimalStory = (): React.ReactElement => {
	const [value, setValue] = useState(text("value", ""));
	const onChange = action("onChange");

	const getValue = React.useCallback((num: number) => onChange(num), [
		onChange,
	]);

	return (
		<NumberDecimal
			label={text("Label", "Number Decimal Input")}
			placeholder={text("Placeholder", "Enter decimal number")}
			fullWidth={boolean("Full Width", true)}
			value={value}
			setValue={setValue}
			getValue={getValue}
			autoFocus={true}
		/>
	);
};

NumberDecimalStory.storyName = "NumberDecimal";
NumberDecimalStory.decorators = [withActions, withKnobs];
NumberDecimalStory.parameters = {
	knobs: {
		escapeHTML: false,
	},
};
