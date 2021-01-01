import React, { useState } from "react";
import { boolean, text, withKnobs } from "@storybook/addon-knobs";
import moment, { Moment } from "moment";
import { action, withActions } from "@storybook/addon-actions";
import DateInput from "../../../../standalone/UIKit/InputControls/DateInput";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";

export const DateInputStory = (): React.ReactElement => {
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
		<DateInput
			label={text("Label", "Date")}
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
DateInputStory.decorators = [withActions, withKnobs];
DateInputStory.parameters = {
	knobs: {
		escapeHTML: false,
	},
};
