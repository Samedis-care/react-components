import React from "react";
import { DatePicker, LocalizationProvider, } from "@mui/x-date-pickers";
import { withMuiWarning } from "../UIKit/MuiWarning";
import useMuiLocaleData from "./useMuiLocaleData";
const LocalizedDatePicker = (props) => {
    const localeText = useMuiLocaleData();
    return (React.createElement(LocalizationProvider, { localeText: localeText },
        React.createElement(DatePicker, { format: "L", ...props })));
};
export default React.memo(withMuiWarning(LocalizedDatePicker));
