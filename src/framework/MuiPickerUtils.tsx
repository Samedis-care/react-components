import React, { useEffect } from "react";
import MomentUtils from "@date-io/moment";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import ccI18n from "../i18n";

import moment from "moment";

export interface MuiPickerUtilsProps {
	disable?: boolean;
	children: React.ReactElement;
}

const updateLocale = () => {
	void (async () => {
		try {
			await import("moment/locale/" + ccI18n.language.toLowerCase());
		} catch (e) {
			try {
				await import(
					"moment/locale/" + ccI18n.language.split("-")[0].toLowerCase()
				);
			} catch (e) {
				// locale not found
			}
		} finally {
			moment.locale(ccI18n.language);
		}
	})();
};

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
