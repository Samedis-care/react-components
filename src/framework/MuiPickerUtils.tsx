import React, { useContext } from "react";
import useCurrentLocale from "../utils/useCurrentLocale";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import MomentLocaleContext from "./MomentLocaleContext";

export interface MuiPickerUtilsProps {
	/**
	 * Renders only the children, for an app that brings its own
	 * `LocalizationProvider` (`Framework`'s `disableMuiPickerUtils`).
	 * Default: `false`
	 */
	disable?: boolean;
	/**
	 * The content, whose date pickers use the provider
	 */
	children: React.ReactElement;
}

/**
 * The date pickers' `LocalizationProvider` (moment), on the moment locale
 * `CCI18nProvider` applied last, so a picker already shown takes the format of
 * a new language once its moment locale has loaded. Before the first one
 * applies, and outside a `CCI18nProvider`, on the components-care locale.
 */
const MuiPickerUtils = (props: MuiPickerUtilsProps): React.ReactElement => {
	const { disable } = props;
	const locale = useCurrentLocale();
	const momentLocale = useContext(MomentLocaleContext);

	if (disable) return props.children;

	return (
		<LocalizationProvider
			dateAdapter={AdapterMoment}
			adapterLocale={momentLocale ?? locale}
		>
			{props.children}
		</LocalizationProvider>
	);
};

export default React.memo(MuiPickerUtils);
