import React from "react";
import {
	DatePicker,
	DatePickerProps,
	LocalizationProvider,
} from "@mui/x-date-pickers";
import { withMuiWarning } from "../UIKit/MuiWarning";
import useMuiLocaleData from "./useMuiLocaleData";

type LocalizedDatePickerProps = Omit<DatePickerProps, "format">;

const LocalizedDatePicker = (props: LocalizedDatePickerProps) => {
	const localeText = useMuiLocaleData();
	return (
		<LocalizationProvider localeText={localeText}>
			<DatePicker format={"L"} {...props} />
		</LocalizationProvider>
	);
};

export default React.memo(withMuiWarning(LocalizedDatePicker));
