import React from "react";
import useCurrentLocale from "../utils/useCurrentLocale";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
const MuiPickerUtils = (props) => {
    const { disable } = props;
    const locale = useCurrentLocale();
    if (disable)
        return props.children;
    return (React.createElement(LocalizationProvider, { dateAdapter: AdapterMoment, adapterLocale: locale }, props.children));
};
export default React.memo(MuiPickerUtils);
