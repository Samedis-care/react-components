import React, { useState } from "react";
import { boolean, text, select } from "@storybook/addon-knobs";
import CurrencyInput from "../../../../standalone/UIKit/InputControls/CurrencyInput";
import { action } from "@storybook/addon-actions";
import { useDialogContext } from "../../../../framework";
import { showInfoDialog } from "../../../../non-standalone/Dialog";

export const CurrencyInputStory = (): React.ReactElement => {
	const currencies = ["USD", "EUR", "INR"];
	const [value, setValue] = useState<number | null>(null);
	const [pushDialog] = useDialogContext();

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
			openInfo={() =>
				showInfoDialog(pushDialog, {
					title: text("Dialog title", "Sample title"),
					message: (
						<div
							dangerouslySetInnerHTML={{
								__html: text(
									"Info Text",
									"This is a pretty long info text which supports html. It really is.<br> It explains you what to write in here."
								),
							}}
						/>
					),
					buttons: [
						{
							text: text("Dialog button label", "Ok"),
							onClick: action("onClose"),
							autoFocus: true,
							color: "primary",
						},
					],
				})
			}
		/>
	);
};

CurrencyInputStory.storyName = "CurrencyInput";
