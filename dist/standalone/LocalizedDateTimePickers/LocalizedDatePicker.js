import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback } from "react";
import { DatePicker, LocalizationProvider, } from "@mui/x-date-pickers";
import { withMuiFieldState } from "../UIKit/MuiFieldState";
import useMuiLocaleData from "./useMuiLocaleData";
import usePickerDraft from "./usePickerDraft";
import accessSlotProps from "../../utils/internal/accessSlotProps";
import usePickerValidationError from "./usePickerValidationError";
import withAccessibleError from "./withAccessibleError";
import withRequiredSections from "./withRequiredSections";
import withFieldBlur from "./withFieldBlur";
const LocalizedDatePicker = (props) => {
    const { publishIntermediateValues, ...otherProps } = props;
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
    return (_jsx(LocalizationProvider, { localeText: localeText, children: _jsx(DatePicker, { format: "L", ...otherProps, value: draft.value, onChange: draft.onChange, onOpen: handleOpen, onError: validation.onError, slotProps: {
                ...otherProps.slotProps,
                textField: (ownerState) => {
                    const orgSlotProps = accessSlotProps(ownerState, otherProps.slotProps?.textField);
                    const fieldProps = withAccessibleError(validation.hasValidationError, withRequiredSections({
                        ...orgSlotProps,
                        // called once focus leaves the field, see withFieldBlur
                        onBlur: (event) => {
                            draft.settle();
                            orgSlotProps?.onBlur?.(event);
                        },
                    }));
                    return withFieldBlur(ownerState, fieldProps);
                },
            } }) }));
};
export default React.memo(withMuiFieldState(LocalizedDatePicker));
