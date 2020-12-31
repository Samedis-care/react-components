import React from "react";
import { boolean, text, withKnobs } from "@storybook/addon-knobs";
import PhoneNumberInput from "../../../../standalone/UIKit/InputControls/PhoneNumberInput";

export const PhoneNumberInputStory = (): React.ReactElement => {
	return (
		<PhoneNumberInput
			label={text("Label", "Phone")}
			placeholder={text("Placeholder", "Enter phone number")}
			fullWidth={boolean("100% Width", true)}
			countryCode="US"
			infoText={
				<div
					dangerouslySetInnerHTML={{
						__html: text(
							"Info Text",
							"This is a phone number for contact purpose"
						),
					}}
				/>
			}
		/>
	);
};

PhoneNumberInputStory.storyName = "PhoneNumberInput";
PhoneNumberInputStory.decorators = [withKnobs];
PhoneNumberInputStory.parameters = {
	knobs: {
		escapeHTML: false,
	},
};
