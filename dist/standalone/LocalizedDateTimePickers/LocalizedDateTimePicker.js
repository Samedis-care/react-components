import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback } from "react";
import { DateTimePicker, LocalizationProvider, } from "@mui/x-date-pickers";
import { withMuiWarning } from "../UIKit";
import useMuiLocaleData from "./useMuiLocaleData";
import accessSlotProps from "../../utils/internal/accessSlotProps";
import usePickerDraft from "./usePickerDraft";
const LocalizedDateTimePicker = (props) => {
    const { required, error, fullWidth, onBlur, publishIntermediateValues, ...otherProps } = props;
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
    return (_jsx(LocalizationProvider, { localeText: localeText, children: _jsx(DateTimePicker, { format: "L LT", ...otherProps, value: draft.value, onChange: draft.onChange, onOpen: handleOpen, slotProps: {
                ...otherProps.slotProps,
                textField: (ownerState) => {
                    const orgSlotProps = accessSlotProps(ownerState, otherProps.slotProps?.textField);
                    return {
                        ...orgSlotProps,
                        required,
                        error,
                        fullWidth,
                        onBlur: (event) => {
                            draft.settleOnBlur(event);
                            onBlur?.(event);
                        },
                    };
                },
            } }) }));
};
export default React.memo(withMuiWarning(LocalizedDateTimePicker));
