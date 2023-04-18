import React from "react";
import useCCTranslations from "../utils/useCCTranslations";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";

export interface MuiPickerUtilsProps {
	disable?: boolean;
	children: React.ReactElement;
}

const MuiPickerUtils = (props: MuiPickerUtilsProps): React.ReactElement => {
	const { disable } = props;
	const { i18n } = useCCTranslations();

	if (disable) return props.children;

	return (
		<LocalizationProvider
			dateAdapter={AdapterMoment}
			adapterLocale={i18n.language}
		>
			{props.children}
		</LocalizationProvider>
	);
};

export default React.memo(MuiPickerUtils);
