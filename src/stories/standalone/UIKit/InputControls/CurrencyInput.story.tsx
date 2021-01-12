import React, { useState } from "react";
import { boolean, text, select } from "@storybook/addon-knobs";
import CurrencyInput from "../../../../standalone/UIKit/InputControls/CurrencyInput";
import { action } from "@storybook/addon-actions";

export const CurrencyInputStory = (): React.ReactElement => {
	const currencies = ["USD", "EUR", "INR"];
	const [value, setValue] = useState<number | null>(null);

	return (
		<CurrencyInput
			label={text("Label", "Currency")}
			placeholder={text("Placeholder", "Enter amount")}
			fullWidth={boolean("Full Width", true)}
			disabled={boolean("Disable", false)}
			currency={select("Currency", currencies, "EUR")}
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

CurrencyInputStory.storyName = "CurrencyInput";
