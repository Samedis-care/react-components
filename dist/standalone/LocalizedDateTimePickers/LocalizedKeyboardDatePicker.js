import React from "react";
import { DatePicker, LocalizationProvider, } from "@mui/x-date-pickers";
import { useThemeProps } from "@mui/material";
import { withMuiWarning } from "../UIKit/MuiWarning";
import useMuiLocaleData from "./useMuiLocaleData";
const LocalizedKeyboardDatePicker = (inProps) => {
    const props = useThemeProps({
        props: inProps,
        name: "CcLocalizedKeyboardDatePicker",
    });
    const { hideDisabledIcon, required, error, fullWidth, onBlur, ...otherProps } = props;
    const slotOverrideHideIcon = {
        ...otherProps.slots,
        openPickerIcon: React.Fragment,
    };
    const localeText = useMuiLocaleData();
    return (React.createElement(LocalizationProvider, { localeText: localeText },
        React.createElement(DatePicker, { format: "L", ...otherProps, slots: otherProps.disabled && hideDisabledIcon
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
            } })));
};
export default React.memo(withMuiWarning(LocalizedKeyboardDatePicker));
