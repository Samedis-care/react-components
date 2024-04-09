import React, { useCallback } from "react";
import { IconButton, InputAdornment } from "@mui/material";
import { Info as InfoIcon, Event as CalenderIcon } from "@mui/icons-material";
import { InputLabelConfig } from "../CommonStyles";
import LocalizedDateTimePicker from "../../../standalone/LocalizedDateTimePickers/LocalizedDateTimePicker";
import TextFieldWithHelp from "../TextFieldWithHelp";
const DateTimeInput = (props) => {
    const { openInfo, important, required, error, onBlur, ...muiProps } = props;
    const handleOpenInfo = useCallback((event) => {
        // Prevent calendar popup open event, while clicking on info icon
        event.stopPropagation();
        if (openInfo)
            openInfo();
    }, [openInfo]);
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
                InputProps: {
                    endAdornment: (React.createElement(InputAdornment, { position: "end" },
                        !muiProps.disabled && (React.createElement(IconButton, { size: "large" },
                            React.createElement(CalenderIcon, { color: "disabled" }))),
                        openInfo && (React.createElement(IconButton, { onClick: handleOpenInfo, size: "large" },
                            React.createElement(InfoIcon, { color: "disabled" }))))),
                },
                InputLabelProps: InputLabelConfig,
                ...muiProps.slotProps?.textField,
            },
        } }));
};
export default React.memo(DateTimeInput);
