import React from "react";
import useCurrentLocale from "../utils/useCurrentLocale";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";

export interface MuiPickerUtilsProps {
	disable?: boolean;
	children: React.ReactElement;
}

const MuiPickerUtils = (props: MuiPickerUtilsProps): React.ReactElement => {
	const { disable } = props;
	const locale = useCurrentLocale();

	if (disable) return props.children;

	return (
		<LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={locale}>
			{props.children}
		</LocalizationProvider>
	);
};

export default React.memo(MuiPickerUtils);
