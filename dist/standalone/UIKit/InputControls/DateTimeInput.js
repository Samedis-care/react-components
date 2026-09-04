import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { InputLabelConfig } from "../CommonStyles";
import LocalizedDateTimePicker from "../../../standalone/LocalizedDateTimePickers/LocalizedDateTimePicker";
import accessSlotProps from "../../../utils/internal/accessSlotProps";
import PickersTextFieldWithHelp from "../PickersTextFieldWithHelp";
const DateTimeInput = (props) => {
    const { openInfo, important, required, error, fullWidth, onBlur, ...muiProps } = props;
    return (_jsx(LocalizedDateTimePicker, { ...muiProps, 
        // the picker owns these four: it builds the text field slot props itself, so
        // passing them down through slotProps.textField would be overwritten there
        required: required, error: error, fullWidth: fullWidth, onBlur: onBlur, slots: {
            textField: PickersTextFieldWithHelp,
            ...muiProps.slots,
        }, slotProps: {
            ...muiProps.slotProps,
            textField: (ownerState) => {
                const orgSlotProps = accessSlotProps(ownerState, muiProps.slotProps?.textField);
                return {
                    // @ts-expect-error custom properties in TextFieldWithHelp
                    important,
                    openInfo,
                    ...orgSlotProps,
                    slotProps: {
                        inputLabel: {
                            ...InputLabelConfig,
                            ...orgSlotProps?.slotProps?.inputLabel,
                        },
                    },
                };
            },
        } }));
};
export default React.memo(DateTimeInput);
