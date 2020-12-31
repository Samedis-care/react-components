import React, { useState } from "react";
import { boolean, text, withKnobs } from "@storybook/addon-knobs";
import moment, { Moment } from "moment";
import TypeDate from "../../../../backend-integration/Model/Types/TypeDate";
import DateInput from "../../../../standalone/UIKit/InputControls/DateInput";

export const DateInputStory = (): React.ReactElement => {
	const [selectedDate, handleSelectedDate] = useState(moment());

	return (
		<DateInput
			label={text("Label", "FieldName")}
			fullWidth={boolean("100% Width", true)}
			important={boolean("Important", false)}
			value={selectedDate}
			format={TypeDate.format(moment(selectedDate).format("DD-MM-YYYY"))}
			onChange={(date) => {
				handleSelectedDate(date as Moment);
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

DateInputStory.storyName = "DateInput";
DateInputStory.decorators = [withKnobs];
DateInputStory.parameters = {
	knobs: {
		escapeHTML: false,
	},
};
