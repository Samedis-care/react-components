import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { DatePicker, LocalizationProvider, } from "@mui/x-date-pickers";
import { withMuiWarning } from "../UIKit/MuiWarning";
import useMuiLocaleData from "./useMuiLocaleData";
const LocalizedDatePicker = (props) => {
    const localeText = useMuiLocaleData();
    return (_jsx(LocalizationProvider, { localeText: localeText, children: _jsx(DatePicker, { format: "L", ...props, slotProps: {
                ...props.slotProps,
                popper: {
                    disablePortal: true,
                    ...props.slotProps?.popper,
                },
            } }) }));
};
export default React.memo(withMuiWarning(LocalizedDatePicker));
