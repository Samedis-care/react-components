import React from "react";
import { boolean, text, select } from "@storybook/addon-knobs";
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

CurrencyInputStory.storyName = "CurrencyInput";
