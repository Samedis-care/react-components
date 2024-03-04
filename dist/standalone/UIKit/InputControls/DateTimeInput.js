import React, { useCallback } from "react";
import { IconButton, InputAdornment } from "@mui/material";
import { Info as InfoIcon, Event as CalenderIcon } from "@mui/icons-material";
import { InputLabelConfig, useInputStyles, } from "../CommonStyles";
import LocalizedDateTimePicker from "../../../standalone/LocalizedDateTimePickers/LocalizedDateTimePicker";
const DateTimeInput = (props) => {
    const { openInfo, important, required, error, onBlur, ...muiProps } = props;
    const inputClasses = useInputStyles({ important });
    const handleOpenInfo = useCallback((event) => {
        // Prevent calendar popup open event, while clicking on info icon
        event.stopPropagation();
        if (openInfo)
            openInfo();
    }, [openInfo]);
    return (React.createElement(LocalizedDateTimePicker, { ...muiProps, slotProps: {
            ...muiProps.slotProps,
            textField: {
                required,
                error,
                onBlur,
                InputProps: {
                    classes: inputClasses,
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
