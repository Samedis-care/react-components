import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback } from "react";
import { DatePicker, LocalizationProvider, } from "@mui/x-date-pickers";
import { useThemeProps } from "@mui/material";
import { withMuiFieldState } from "../UIKit/MuiFieldState";
import useMuiLocaleData from "./useMuiLocaleData";
import accessSlotProps from "../../utils/internal/accessSlotProps";
import usePickerDraft from "./usePickerDraft";
const NoIcon = () => {
    return _jsx(_Fragment, {});
};
const LocalizedKeyboardDatePicker = (inProps) => {
    const props = useThemeProps({
        props: inProps,
        name: "CcLocalizedKeyboardDatePicker",
    });
    const { hideDisabledIcon, required, error, fullWidth, onBlur, disableClearable, publishIntermediateValues, ...otherProps } = props;
    const slotOverrideHideIcon = {
        ...otherProps.slots,
        openPickerIcon: NoIcon,
    };
    const localeText = useMuiLocaleData();
    const draft = usePickerDraft(otherProps.value, otherProps.onChange, publishIntermediateValues);
    const { settle } = draft;
    const consumerOnOpen = otherProps.onOpen;
    const handleOpen = useCallback(() => {
        // the calendar renders from the value it is given, so a half-typed date
        // would open it on a year nothing is selectable in
        settle();
        consumerOnOpen?.();
    }, [settle, consumerOnOpen]);
    return (_jsx(LocalizationProvider, { localeText: localeText, children: _jsx(DatePicker, { format: "L", ...otherProps, value: draft.value, onChange: draft.onChange, onOpen: handleOpen, slots: otherProps.disabled && hideDisabledIcon
                ? slotOverrideHideIcon
                : otherProps.slots, slotProps: {
                ...otherProps.slotProps,
                textField: (ownerState) => {
                    const textFieldProps = accessSlotProps(ownerState, otherProps.slotProps?.textField);
                    return {
                        ...textFieldProps,
                        // only where the caller actually gave one, so a value passed
                        // through slotProps.textField is not overwritten with undefined
                        ...(required === undefined ? {} : { required }),
                        ...(error === undefined ? {} : { error }),
                        ...(fullWidth === undefined ? {} : { fullWidth }),
                        onBlur: (event) => {
                            draft.settleOnBlur(event);
                            textFieldProps?.onBlur?.(event);
                            onBlur?.(event);
                        },
                        // disableClearable suppresses the clear button that our
                        // TextFieldWithHelp based fields render on touch devices. MUI's
                        // own PickersTextField has no such button and forwards the prop
                        // it does not know to the DOM, so it is only sent on to a text
                        // field that was actually swapped in for it.
                        ...(otherProps.slots?.textField ? { disableClearable } : {}),
                    };
                },
            } }) }));
};
export default React.memo(withMuiFieldState(LocalizedKeyboardDatePicker));
