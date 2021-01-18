import React, { useState } from "react";
import { boolean, text } from "@storybook/addon-knobs";
import IntegerInputField from "../../../../standalone/UIKit/InputControls/IntegerInputField";
import { action } from "@storybook/addon-actions";

export const IntegerInputFieldStory = (): React.ReactElement => {
	const [value, setValue] = useState<number | null>(null);

	return (
		<IntegerInputField
			label={text("Label", "Number Integer Input")}
			placeholder={text("Placeholder", "Enter integer number")}
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

IntegerInputFieldStory.storyName = "IntegerInputField";
