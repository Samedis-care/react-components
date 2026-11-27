import { jsx as _jsx } from "react/jsx-runtime";
import React, { useContext } from "react";
import useCurrentLocale from "../utils/useCurrentLocale";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import MomentLocaleContext from "./MomentLocaleContext";
/**
 * The date pickers' `LocalizationProvider` (moment), on the moment locale
 * `CCI18nProvider` applied last, so a picker already shown takes the format of
 * a new language once its moment locale has loaded. Before the first one
 * applies, and outside a `CCI18nProvider`, on the components-care locale.
 */
const MuiPickerUtils = (props) => {
    const { disable } = props;
    const locale = useCurrentLocale();
    const momentLocale = useContext(MomentLocaleContext);
    if (disable)
        return props.children;
    return (_jsx(LocalizationProvider, { dateAdapter: AdapterMoment, adapterLocale: momentLocale ?? locale, children: props.children }));
};
export default React.memo(MuiPickerUtils);
