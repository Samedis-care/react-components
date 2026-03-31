import React from "react";
import { DatePicker, LocalizationProvider, } from "@mui/x-date-pickers";
import { useThemeProps } from "@mui/material";
import { withMuiWarning } from "../UIKit/MuiWarning";
import useMuiLocaleData from "./useMuiLocaleData";
import accessSlotProps from "../../utils/internal/accessSlotProps";
const NoIcon = () => {
    return React.createElement(React.Fragment, null);
};
const LocalizedKeyboardDatePicker = (inProps) => {
    const props = useThemeProps({
        props: inProps,
        name: "CcLocalizedKeyboardDatePicker",
    });
    const { hideDisabledIcon, required, error, fullWidth, onBlur, disableClearable, ...otherProps } = props;
    const slotOverrideHideIcon = {
        ...otherProps.slots,
        openPickerIcon: NoIcon,
    };
    const localeText = useMuiLocaleData();
    return (React.createElement(LocalizationProvider, { localeText: localeText },
        React.createElement(DatePicker, { format: "L", ...otherProps, slots: otherProps.disabled && hideDisabledIcon
                ? slotOverrideHideIcon
                : otherProps.slots, slotProps: {
                ...otherProps.slotProps,
                popper: {
                    // Render the calendar popover inside the current DOM tree
                    // instead of via Portal at <body>. This ensures the popover
                    // stays within a parent Dialog's focus trap, allowing
                    // keyboard interaction (e.g. Enter to select a date).
                    disablePortal: true,
                    ...otherProps.slotProps?.popper,
                },
                textField: (ownerState) => {
                    const textFieldProps = accessSlotProps(ownerState, otherProps.slotProps?.textField);
                    return {
                        required,
                        error,
                        fullWidth,
                        onBlur,
                        disableClearable,
                        ...textFieldProps,
                    };
                },
            } })));
};
export default React.memo(withMuiWarning(LocalizedKeyboardDatePicker));
