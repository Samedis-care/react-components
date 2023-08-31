import React from "react";
import { InputLabelConfig } from "../CommonStyles";
import { LocalizedKeyboardDatePicker } from "../../../standalone/LocalizedDateTimePickers";
import TextFieldWithHelp from "../TextFieldWithHelp";
import { localDateToUtcDate } from "../../../utils";
import moment from "moment";
const DateInput = (props) => {
    const { value, onChange, hideDisabledIcon, required, error, fullWidth, onBlur, ...muiProps } = props;
    return (React.createElement(LocalizedKeyboardDatePicker, { ...muiProps, value: value ? moment(value) : null, onChange: (date) => date ? onChange(localDateToUtcDate(date.toDate())) : onChange(null), hideDisabledIcon: hideDisabledIcon, required: required, error: error, fullWidth: fullWidth, onBlur: onBlur, slots: {
            textField: TextFieldWithHelp,
        }, slotProps: {
            ...muiProps.slotProps,
            textField: {
                InputLabelProps: InputLabelConfig,
                ...muiProps.slotProps?.textField,
            },
        } }));
};
export default React.memo(DateInput);
