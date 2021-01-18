import React, { useState } from "react";
import { boolean, text } from "@storybook/addon-knobs";
import DecimalInputField from "../../../../standalone/UIKit/InputControls/DecimalInputField";
import { action } from "@storybook/addon-actions";

export const DecimalInputFieldStory = (): React.ReactElement => {
	const [value, setValue] = useState<number | null>(null);

	return (
		<DecimalInputField
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

DecimalInputFieldStory.storyName = "DecimalInputField";
