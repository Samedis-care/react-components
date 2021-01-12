import React, { useState } from "react";
import { boolean, text } from "@storybook/addon-knobs";
import NumberInteger from "../../../../standalone/UIKit/InputControls/NumberInteger";
import { action } from "@storybook/addon-actions";

export const NumberIntegerStory = (): React.ReactElement => {
	const [value, setValue] = useState<number | null>(null);

	return (
		<NumberInteger
			label={text("Label", "Number Integer Input")}
			placeholder={text("Placeholder", "Enter integer number")}
			fullWidth={boolean("Full Width", true)}
			value={value}
			onChange={(evt: React.ChangeEvent, value: number | null) => {
				action("onChange")(evt, value);
				setValue(value);
			}}
			autoFocus={true}
		/>
	);
};

NumberIntegerStory.storyName = "NumberInteger";
