import React from "react";
import MomentUtils from "@date-io/moment";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import ccI18n from "../i18n";

import moment from "moment";

export interface MuiPickerUtilsProps {
	disable?: boolean;
	children: React.ReactElement;
}

const MuiPickerUtils = (props: MuiPickerUtilsProps): React.ReactElement => {
	const { disable } = props;

	if (disable) return props.children;

	return (
		<MuiPickersUtilsProvider
			libInstance={moment}
			utils={MomentUtils}
			locale={ccI18n.language}
		>
			{props.children}
		</MuiPickersUtilsProvider>
	);
};

export default React.memo(MuiPickerUtils);
