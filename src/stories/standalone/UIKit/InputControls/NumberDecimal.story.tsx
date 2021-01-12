import React, { useState } from "react";
import { boolean, text, number } from "@storybook/addon-knobs";
import NumberDecimal from "../../../../standalone/UIKit/InputControls/NumberDecimal";
import { action } from "@storybook/addon-actions";

export const NumberDecimalStory = (): React.ReactElement => {
	const [value] = useState(number("value", 0.0));
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
			getValue={getValue}
			autoFocus={true}
		/>
	);
};

NumberDecimalStory.storyName = "NumberDecimal";
