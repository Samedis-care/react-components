import React from "react";
import { InputLabelConfig } from "../CommonStyles";
import LocalizedDateTimePicker from "../../../standalone/LocalizedDateTimePickers/LocalizedDateTimePicker";
import TextFieldWithHelp from "../TextFieldWithHelp";
const DateTimeInput = (props) => {
    const { openInfo, important, required, error, fullWidth, onBlur, ...muiProps } = props;
    return (React.createElement(LocalizedDateTimePicker, { ...muiProps, slots: {
            textField: TextFieldWithHelp,
            ...muiProps.slots,
        }, slotProps: {
            ...muiProps.slotProps,
            textField: {
                // @ts-expect-error custom property for slot
                important,
                required,
                error,
                onBlur,
                fullWidth,
                openInfo,
                InputLabelProps: InputLabelConfig,
                ...muiProps.slotProps?.textField,
            },
        } }));
};
export default React.memo(DateTimeInput);
