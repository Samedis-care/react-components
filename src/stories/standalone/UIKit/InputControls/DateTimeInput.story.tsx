import React, { useState } from "react";
import { boolean, text } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";
import DateTimeInput from "../../../../standalone/UIKit/InputControls/DateTimeInput";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";

export const DateTimeInputStory = (): React.ReactElement => {
	const [selectedDate, setSelectedDate] = useState<MaterialUiPickersDate>(null);
	const onChange = action("onChange");

	const handleChange = React.useCallback(
		(date: MaterialUiPickersDate): MaterialUiPickersDate => {
			onChange(date);
			setSelectedDate(date);
			return date;
		},
		[onChange]
	);

	return (
		<DateTimeInput
			label={text("Label", "DateTime Field")}
			disabled={boolean("Disable", false)}
			fullWidth={boolean("100% Width", true)}
			important={boolean("Important", false)}
			placeholder={text("placeholder", "Please Select Date & Time")}
			value={selectedDate}
			onChange={handleChange}
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

DateTimeInputStory.storyName = "DateTimeInput";
