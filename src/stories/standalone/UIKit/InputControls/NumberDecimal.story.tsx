import React, { useState } from "react";
import { boolean, text } from "@storybook/addon-knobs";
import NumberDecimal from "../../../../standalone/UIKit/InputControls/NumberDecimal";
import { action } from "@storybook/addon-actions";

export const NumberDecimalStory = (): React.ReactElement => {
	const [value, setValue] = useState<number | null>(null);

	return (
		<NumberDecimal
			label={text("Label", "Number Decimal Input")}
			placeholder={text("Placeholder", "Enter decimal number")}
			fullWidth={boolean("Full Width", true)}
			disabled={boolean("Disable", false)}
			value={value}
			onChange={(evt: React.ChangeEvent, value: number | null) => {
				action("onChange")(evt, value);
				setValue(value);
			}}
			autoFocus={true}
			infoText={
				<div
					dangerouslySetInnerHTML={{
						__html: text(
							"Info Text",
							"This is a pretty long info text which supports html"
						),
					}}
				/>
			}
		/>
	);
};

NumberDecimalStory.storyName = "NumberDecimal";
