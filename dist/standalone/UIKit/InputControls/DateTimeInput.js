import React from "react";
import { InputLabelConfig } from "../CommonStyles";
import LocalizedDateTimePicker from "../../../standalone/LocalizedDateTimePickers/LocalizedDateTimePicker";
import TextFieldWithHelp from "../TextFieldWithHelp";
import accessSlotProps from "../../../utils/internal/accessSlotProps";
const DateTimeInput = (props) => {
    const { openInfo, important, required, error, fullWidth, onBlur, ...muiProps } = props;
    return (React.createElement(LocalizedDateTimePicker, { ...muiProps, slots: {
            textField: TextFieldWithHelp,
            ...muiProps.slots,
        }, slotProps: {
            ...muiProps.slotProps,
            textField: (ownerState) => {
                const orgSlotProps = accessSlotProps(ownerState, muiProps.slotProps?.textField);
                return {
                    // @ts-expect-error custom properties in TextFieldWithHelp
                    important,
                    required,
                    error,
                    onBlur,
                    fullWidth,
                    openInfo,
                    ...orgSlotProps,
                    slotProps: {
                        inputLabel: {
                            ...InputLabelConfig,
                            ...orgSlotProps?.InputLabelProps,
                        },
                    },
                };
            },
        } }));
};
export default React.memo(DateTimeInput);
