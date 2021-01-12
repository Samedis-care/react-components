import React, { useState } from "react";
import { boolean, text, select } from "@storybook/addon-knobs";
import PhoneNumberInput from "../../../../standalone/UIKit/InputControls/PhoneNumberInput";
import { CountryCode } from "libphonenumber-js";
import { action } from "@storybook/addon-actions";

export const PhoneNumberInputStory = (): React.ReactElement => {
	const countryCodes: CountryCode[] = ["US", "DE", "FR", "RU"];
	const [value, setValue] = useState("");

	return (
		<PhoneNumberInput
			label={text("Label", "Phone")}
			placeholder={text("Placeholder", "Enter phone number")}
			fullWidth={boolean("100% Width", true)}
			disabled={boolean("Disable", false)}
			countryCode={select("CountryCode", countryCodes, "US")}
			value={value}
			onChange={(evt: React.ChangeEvent, value: string) => {
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
