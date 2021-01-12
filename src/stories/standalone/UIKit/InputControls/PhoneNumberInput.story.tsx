import React, { useState } from "react";
import { boolean, text, select } from "@storybook/addon-knobs";
import PhoneNumberInput from "../../../../standalone/UIKit/InputControls/PhoneNumberInput";
import { CountryCode } from "libphonenumber-js";
import { action } from "@storybook/addon-actions";

export const PhoneNumberInputStory = (): React.ReactElement => {
	const countryCodes = ["US", "DE", "FR", "RU"] as CountryCode[];
	const [value, setValue] = useState<number | null>(null);

	return (
		<PhoneNumberInput
			label={text("Label", "Phone")}
			placeholder={text("Placeholder", "Enter phone number")}
			fullWidth={boolean("100% Width", true)}
			disabled={boolean("Disable", false)}
			countryCode={select("CountryCode", countryCodes, "US")}
			value={value}
			onChange={(evt: React.ChangeEvent, value: number | null) => {
				action("onChange")(evt, value);
				setValue(value);
			}}
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
