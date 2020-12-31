import React from "react";
import { boolean, text, select, withKnobs } from "@storybook/addon-knobs";
import PhoneNumberInput from "../../../../standalone/UIKit/InputControls/PhoneNumberInput";
import { CountryCode } from "libphonenumber-js";

export const PhoneNumberInputStory = (): React.ReactElement => {
	const countryCodes = ["US", "DE", "FR", "RU"] as CountryCode[];
	return (
		<PhoneNumberInput
			label={text("Label", "Phone")}
			placeholder={text("Placeholder", "Enter phone number")}
			fullWidth={boolean("100% Width", true)}
			countryCode={select("CountryCode", countryCodes, "US")}
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
