import React from "react";
import MomentUtils from "@date-io/moment";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";

export interface MuiPickerUtilsProps {
	disable?: boolean;
	children: React.ReactElement;
}

const MuiPickerUtils = (props: MuiPickerUtilsProps): React.ReactElement => {
	if (props.disable) return props.children;

	return (
		<MuiPickersUtilsProvider utils={MomentUtils}>
			{props.children}
		</MuiPickersUtilsProvider>
	);
};

export default React.memo(MuiPickerUtils);
