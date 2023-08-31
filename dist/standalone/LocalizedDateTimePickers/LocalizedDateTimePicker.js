import React from "react";
import { DateTimePicker } from "@mui/x-date-pickers";
import { withMuiWarning } from "../UIKit";
const LocalizedDateTimePicker = (props) => {
    const { required, error, fullWidth, onBlur, ...otherProps } = props;
    return (React.createElement(DateTimePicker, { format: "L LT", ...otherProps, slotProps: {
            ...otherProps.slotProps,
            textField: {
                required,
                error,
                fullWidth,
                onBlur,
                ...otherProps.slotProps?.textField,
            },
        } }));
};
export default React.memo(withMuiWarning(LocalizedDateTimePicker));
