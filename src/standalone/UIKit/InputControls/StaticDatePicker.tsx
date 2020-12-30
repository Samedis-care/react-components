import React from "react";
import { Dialog } from "@material-ui/core";
import { DatePicker } from "@material-ui/pickers";

export interface StaticDatePickerProps {
	open: boolean;
	date: Date;
	onChange: (date: unknown) => void;
}

const StaticDatePicker = (props: StaticDatePickerProps) => {
	const { open, date } = props;
	return (
		<Dialog disableBackdropClick open={open}>
			<DatePicker
				open
				autoOk
				variant="static"
				openTo="date"
				value={date}
				onChange={props.onChange}
			/>
		</Dialog>
	);
};

export default React.memo(StaticDatePicker);
