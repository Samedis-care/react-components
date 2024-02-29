import React from "react";
import { DatePicker, DatePickerProps } from "@mui/x-date-pickers";
import { withMuiWarning } from "../UIKit/MuiWarning";
import { Moment } from "moment";

type LocalizedDatePickerProps = Omit<DatePickerProps<Moment | null>, "format">;

const LocalizedDatePicker = (props: LocalizedDatePickerProps) => {
	return <DatePicker format={"L"} {...props} />;
};

export default React.memo(withMuiWarning(LocalizedDatePicker));
