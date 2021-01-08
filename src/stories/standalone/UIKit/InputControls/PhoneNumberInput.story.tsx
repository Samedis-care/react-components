import React, { useState } from "react";
import { boolean, text, select, withKnobs } from "@storybook/addon-knobs";
import PhoneNumberInput from "../../../../standalone/UIKit/InputControls/PhoneNumberInput";
import { CountryCode } from "libphonenumber-js";
import { action, withActions } from "@storybook/addon-actions";

export const PhoneNumberInputStory = (): React.ReactElement => {
	const countryCodes = ["US", "DE", "FR", "RU"] as CountryCode[];
	const [value, setValue] = useState(text("value", ""));
	const onChange = action("onChange");

	const getValue = React.useCallback((num: string) => onChange(num), [
		onChange,
	]);
	return (
		<PhoneNumberInput
			label={text("Label", "Phone")}
			placeholder={text("Placeholder", "Enter phone number")}
			fullWidth={boolean("100% Width", true)}
			countryCode={select("CountryCode", countryCodes, "US")}
			value={value}
			setValue={setValue}
			getValue={getValue}
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
PhoneNumberInputStory.decorators = [withActions, withKnobs];
PhoneNumberInputStory.parameters = {
	knobs: {
		escapeHTML: false,
	},
};
