import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { DateTimePicker, LocalizationProvider, } from "@mui/x-date-pickers";
import { withMuiWarning } from "../UIKit";
import useMuiLocaleData from "./useMuiLocaleData";
import accessSlotProps from "../../utils/internal/accessSlotProps";
const LocalizedDateTimePicker = (props) => {
    const { required, error, fullWidth, onBlur, ...otherProps } = props;
    const localeText = useMuiLocaleData();
    return (_jsx(LocalizationProvider, { localeText: localeText, children: _jsx(DateTimePicker, { format: "L LT", ...otherProps, slotProps: {
                ...otherProps.slotProps,
                popper: {
                    disablePortal: true,
                    ...otherProps.slotProps?.popper,
                },
                textField: (ownerState) => {
                    const orgSlotProps = accessSlotProps(ownerState, otherProps.slotProps?.textField);
                    return {
                        ...orgSlotProps,
                        required,
                        error,
                        fullWidth,
                        onBlur,
                    };
                },
            } }) }));
};
export default React.memo(withMuiWarning(LocalizedDateTimePicker));
