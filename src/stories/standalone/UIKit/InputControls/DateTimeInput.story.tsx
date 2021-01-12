import React, { useState } from "react";
import { boolean, text } from "@storybook/addon-knobs";
import moment, { Moment } from "moment";
import { action } from "@storybook/addon-actions";
import DateTimeInput from "../../../../standalone/UIKit/InputControls/DateTimeInput";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";

export const DateTimeInputStory = (): React.ReactElement => {
	const [selectedDate, setSelectedDate] = useState(moment());
	const onChange = action("onChange");

	const handleChange = React.useCallback(
		(date: MaterialUiPickersDate): MaterialUiPickersDate => {
			onChange(date);
			setSelectedDate(date as Moment);
			return date;
		},
		[onChange]
	);

	return (
		<DateTimeInput
			label={text("Label", "DateTime Field")}
			fullWidth={boolean("100% Width", true)}
			important={boolean("Important", false)}
			placeholder={text("placeholder", "Please Select Date & Time")}
			value={selectedDate}
			// format="DD/MM/YYYY hh:mm A"
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
