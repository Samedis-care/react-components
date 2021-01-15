import React, { useState } from "react";
import { boolean, text } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";
import DateInput from "../../../../standalone/UIKit/InputControls/DateInput";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";

export const DateInputStory = (): React.ReactElement => {
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
		<DateInput
			label={text("Label", "Date")}
			disabled={boolean("Disable", false)}
			fullWidth={boolean("100% Width", true)}
			important={boolean("Important", false)}
			placeholder={text("placeholder", "Please Select Date")}
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

DateInputStory.storyName = "DateInput";
