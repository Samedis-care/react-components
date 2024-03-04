import React from "react";
import { DatePicker } from "@mui/x-date-pickers";
import { useTheme } from "@mui/material";
import { withMuiWarning } from "../UIKit/MuiWarning";
const LocalizedKeyboardDatePicker = (props) => {
    const { hideDisabledIcon, required, error, fullWidth, onBlur, ...otherProps } = props;
    const theme = useTheme();
    const hideDisabledIcons = hideDisabledIcon ?? theme.componentsCare?.uiKit?.hideDisabledIcons;
    const slotOverrideHideIcon = {
        ...otherProps.slots,
        openPickerIcon: React.Fragment,
    };
    return (React.createElement(DatePicker, { format: "L", ...otherProps, slots: otherProps.disabled && hideDisabledIcons
            ? slotOverrideHideIcon
            : otherProps.slots, slotProps: {
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
export default React.memo(withMuiWarning(LocalizedKeyboardDatePicker));
