import React from "react";
import { boolean, text, select, withKnobs } from "@storybook/addon-knobs";
import CurrencyInput from "../../../../standalone/UIKit/InputControls/CurrencyInput";

export const CurrencyInputStory = (): React.ReactElement => {
	const currencies = ["USD", "EUR", "INR"];
	return (
		<CurrencyInput
			label={text("Label", "Currency")}
			placeholder={text("Placeholder", "Enter amount")}
			fullWidth={boolean("Full Width", true)}
			currency={select("Currency", currencies, "EUR")}
			autoFocus={true}
		/>
	);
};

CurrencyInputStory.storyName = "CurrencyInput";
CurrencyInputStory.decorators = [withKnobs];
CurrencyInputStory.parameters = {
	knobs: {
		escapeHTML: false,
	},
};
