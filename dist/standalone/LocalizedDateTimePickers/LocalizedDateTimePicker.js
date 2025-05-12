import React from "react";
import { DateTimePicker, LocalizationProvider, } from "@mui/x-date-pickers";
import { withMuiWarning } from "../UIKit";
import useMuiLocaleData from "./useMuiLocaleData";
import accessSlotProps from "../../utils/internal/accessSlotProps";
const LocalizedDateTimePicker = (props) => {
    const { required, error, fullWidth, onBlur, ...otherProps } = props;
    const localeText = useMuiLocaleData();
    return (React.createElement(LocalizationProvider, { localeText: localeText },
        React.createElement(DateTimePicker, { format: "L LT", ...otherProps, slotProps: {
                ...otherProps.slotProps,
                textField: (ownerState) => {
                    const orgSlotProps = accessSlotProps(ownerState, otherProps.slotProps?.textField);
                    return {
                        required,
                        error,
                        fullWidth,
                        onBlur,
                        ...orgSlotProps,
                    };
                },
            } })));
};
export default React.memo(withMuiWarning(LocalizedDateTimePicker));
