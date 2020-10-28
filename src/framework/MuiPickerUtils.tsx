import React, { useEffect } from "react";
import MomentUtils from "@date-io/moment";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import ccI18n from "../i18n";
import moment from "moment";

export interface MuiPickerUtilsProps {
	disable?: boolean;
	children: React.ReactElement;
}

const updateLocale = () => moment.locale(ccI18n.language);

const MuiPickerUtils = (props: MuiPickerUtilsProps): React.ReactElement => {
	const { disable } = props;

	useEffect(() => {
		if (disable) return;

		updateLocale();
		ccI18n.on("languageChanged", updateLocale);
		return () => ccI18n.off("languageChanged", updateLocale);
	}, [disable]);

	if (disable) return props.children;

	return (
		<MuiPickersUtilsProvider utils={MomentUtils}>
			{props.children}
		</MuiPickersUtilsProvider>
	);
};

export default React.memo(MuiPickerUtils);
