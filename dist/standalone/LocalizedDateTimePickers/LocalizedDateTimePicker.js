import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback } from "react";
import { DateTimePicker, LocalizationProvider, } from "@mui/x-date-pickers";
import { withMuiFieldState } from "../UIKit";
import useMuiLocaleData from "./useMuiLocaleData";
import accessSlotProps from "../../utils/internal/accessSlotProps";
import usePickerDraft from "./usePickerDraft";
import usePickerValidationError from "./usePickerValidationError";
import withAccessibleError from "./withAccessibleError";
import withRequiredSections from "./withRequiredSections";
import withFieldBlur from "./withFieldBlur";
const LocalizedDateTimePicker = (props) => {
    const { required, error, fullWidth, onBlur, publishIntermediateValues, ...otherProps } = props;
    const localeText = useMuiLocaleData();
    const draft = usePickerDraft(otherProps.value, otherProps.onChange, publishIntermediateValues);
    const validation = usePickerValidationError(otherProps.onError);
    const { settle } = draft;
    const consumerOnOpen = otherProps.onOpen;
    const handleOpen = useCallback(() => {
        // the calendar renders from the value it is given, so a half-typed date
        // would open it on a year nothing is selectable in
        settle();
        consumerOnOpen?.();
    }, [settle, consumerOnOpen]);
    return (_jsx(LocalizationProvider, { localeText: localeText, children: _jsx(DateTimePicker, { format: "L LT", ...otherProps, value: draft.value, onChange: draft.onChange, onOpen: handleOpen, onError: validation.onError, slotProps: {
                ...otherProps.slotProps,
                textField: (ownerState) => {
                    const orgSlotProps = accessSlotProps(ownerState, otherProps.slotProps?.textField);
                    const fieldProps = withAccessibleError(validation.hasValidationError, withRequiredSections({
                        ...orgSlotProps,
                        // only where the caller actually gave one, so a value passed
                        // through slotProps.textField is not overwritten with undefined
                        ...(required === undefined ? {} : { required }),
                        ...(error === undefined ? {} : { error }),
                        ...(fullWidth === undefined ? {} : { fullWidth }),
                        // called once focus leaves the field, see withFieldBlur
                        onBlur: (event) => {
                            draft.settle();
                            orgSlotProps?.onBlur?.(event);
                            onBlur?.(event);
                        },
                    }));
                    return withFieldBlur(ownerState, fieldProps);
                },
            } }) }));
};
export default React.memo(withMuiFieldState(LocalizedDateTimePicker));
