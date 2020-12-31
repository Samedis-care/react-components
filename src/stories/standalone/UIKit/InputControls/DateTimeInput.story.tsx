import React, { useState } from "react";
import { boolean, text, withKnobs } from "@storybook/addon-knobs";
import moment from "moment";
import DateTimeInput from "../../../../standalone/UIKit/InputControls/DateTimeInput";

export const DateTimeInputStory = (): React.ReactElement => {
	const [selectedDate, handleSelectedDate] = useState(moment());

	return (
		<DateTimeInput
			label={text("Label", "FieldName")}
			fullWidth={boolean("100% Width", true)}
			important={boolean("Important", false)}
			value={selectedDate}
			format="DD/MM/YYYY hh:mm A"
			onChange={(date) => {
				if (!date) throw new Error("Datetime is null");
				else handleSelectedDate(date);
			}}
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
DateTimeInputStory.decorators = [withKnobs];
DateTimeInputStory.parameters = {
	knobs: {
		escapeHTML: false,
	},
};
