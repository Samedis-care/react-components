import React from "react";
import PickersTextFieldWithHelp from "../PickersTextFieldWithHelp";
import localDateToUtcDate from "../../../utils/localDateToUtcDate";
import moment from "moment";
import LocalizedKeyboardDatePicker from "../../LocalizedDateTimePickers/LocalizedKeyboardDatePicker";
import accessSlotProps from "../../../utils/internal/accessSlotProps";
const DateInput = (props) => {
    const { value, onChange, hideDisabledIcon, required, error, fullWidth, onBlur, ...muiProps } = props;
    return (React.createElement(LocalizedKeyboardDatePicker, { ...muiProps, value: value ? moment(value) : null, onChange: (date) => date ? onChange(localDateToUtcDate(date.toDate())) : onChange(null), hideDisabledIcon: hideDisabledIcon, required: required, error: error, fullWidth: fullWidth, onBlur: onBlur, slots: {
            textField: PickersTextFieldWithHelp,
        }, slotProps: {
            ...muiProps.slotProps,
            textField: (ownerState) => {
                const textFieldSlotPropsProp = accessSlotProps(ownerState, muiProps.slotProps?.textField);
                return {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore This just passes props down to the text field component, TS defs don't support custom props here, but the implementation does.
                    customHandleClear: () => onChange(null),
                    ...textFieldSlotPropsProp,
                };
            },
        } }));
};
export default React.memo(DateInput);
