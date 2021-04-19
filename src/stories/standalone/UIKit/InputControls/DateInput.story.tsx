import React, { useState } from "react";
import { boolean, text } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";
import DateInput from "../../../../standalone/UIKit/InputControls/DateInput";
import { useDialogContext } from "../../../../framework";
import { showInfoDialog } from "../../../../non-standalone";

export const DateInputStory = (): React.ReactElement => {
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const onChange = action("onChange");
	const [pushDialog] = useDialogContext();
	const dialogTitle = text("Dialog title", "Sample title");
	const infoText = text(
		"Info Text",
		"This is a pretty long info text which supports html. It really is.<br> It explains you what to write in here."
	);
	const dialogButtonLabel = text("Dialog button label", "Ok");
	const dialogButtonClick = action("onClose");

	const handleChange = React.useCallback(
		(date: Date | null) => {
			onChange(date);
			setSelectedDate(date);
		},
		[onChange]
	);

	return (
		<DateInput
			label={text("Label", "Date")}
			disabled={boolean("Disable", false)}
			hideDisabledIcon={boolean("Hide Calendar Icon (if disabled)", false)}
			fullWidth={boolean("100% Width", true)}
			important={boolean("Important", false)}
			placeholder={text("placeholder", "Please Select Date")}
			value={selectedDate}
			onChange={handleChange}
			onError={action("onError")}
			openInfo={() =>
				showInfoDialog(pushDialog, {
					title: dialogTitle,
					message: (
						<div
							dangerouslySetInnerHTML={{
								__html: infoText,
							}}
						/>
					),
					buttons: [
						{
							text: dialogButtonLabel,
							onClick: dialogButtonClick,
							autoFocus: true,
							color: "primary",
						},
					],
				})
			}
		/>
	);
};

DateInputStory.storyName = "DateInput";
