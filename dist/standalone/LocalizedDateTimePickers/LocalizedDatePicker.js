import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useMemo } from "react";
import { DatePicker, LocalizationProvider, } from "@mui/x-date-pickers";
import { withMuiFieldState } from "../UIKit/MuiFieldState";
import useMuiLocaleData from "./useMuiLocaleData";
import usePickerDraft from "./usePickerDraft";
import accessSlotProps from "../../utils/internal/accessSlotProps";
import usePickerValidationError from "./usePickerValidationError";
import usePickerErrorMessage from "./usePickerErrorMessage";
import withAccessibleError from "./withAccessibleError";
import withRequiredSections from "./withRequiredSections";
import useFieldBlur from "./useFieldBlur";
import withFieldName from "./withFieldName";
import withReportWhenDone from "./withReportWhenDone";
import calendarNameSlotProps from "./calendarNameSlotProps";
import calendarFocusRingSlotProps from "./calendarFocusRingSlotProps";
import OpenPickerButton from "./OpenPickerButton";
const LocalizedDatePicker = (props) => {
    const { publishIntermediateValues, "aria-label": ariaLabel, ...otherProps } = props;
    const localeText = useMuiLocaleData();
    const draft = usePickerDraft(otherProps.value, otherProps.onChange, publishIntermediateValues, otherProps.defaultValue);
    const validation = usePickerValidationError(otherProps.onError);
    const errorMessage = usePickerErrorMessage(validation.shownError, {
        minDate: otherProps.minDate,
        maxDate: otherProps.maxDate,
    });
    const withFieldBlur = useFieldBlur();
    const { settle, accept } = draft;
    const consumerOnOpen = otherProps.onOpen;
    const handleOpen = useCallback(() => {
        // the calendar renders from the value it is given, so a half-typed date
        // would open it on a year nothing is selectable in
        settle();
        consumerOnOpen?.();
    }, [settle, consumerOnOpen]);
    const consumerOnAccept = otherProps.onAccept;
    const handleAccept = useCallback((value, context) => {
        // a date the calendar accepted is reported at once, see onChange
        accept(value, context);
        consumerOnAccept?.(value, context);
    }, [accept, consumerOnAccept]);
    const consumerSlots = otherProps.slots;
    // the caller's slots come after the open button with its focus ring, so a
    // button it passes wins
    const slots = useMemo(() => ({ openPickerButton: OpenPickerButton, ...consumerSlots }), [consumerSlots]);
    return (_jsx(LocalizationProvider, { localeText: localeText, children: _jsx(DatePicker, { format: "L", ...otherProps, value: draft.value, onChange: draft.onChange, onOpen: handleOpen, onAccept: handleAccept, onError: validation.onError, slots: slots, slotProps: {
                ...otherProps.slotProps,
                ...calendarNameSlotProps(otherProps.slotProps, {
                    name: ariaLabel,
                    hasLabel: !!otherProps.label,
                    fallbackName: otherProps.localeText?.toolbarTitle ??
                        localeText?.datePickerToolbarTitle,
                }),
                ...calendarFocusRingSlotProps(otherProps.slotProps),
                textField: (ownerState) => {
                    const orgSlotProps = accessSlotProps(ownerState, otherProps.slotProps?.textField);
                    const fieldProps = withAccessibleError(validation.hasValidationError, withRequiredSections({
                        ...orgSlotProps,
                        // called once focus leaves the field, see withFieldBlur
                        onBlur: (event) => {
                            validation.onFieldLeave();
                            orgSlotProps?.onBlur?.(event);
                        },
                    }), errorMessage);
                    return withFieldBlur(ownerState, withFieldName(withReportWhenDone(fieldProps, draft), ariaLabel), {
                        name: otherProps.name,
                        onFieldFocus: validation.onFieldFocus,
                    });
                },
            } }) }));
};
export default React.memo(withMuiFieldState(LocalizedDatePicker));
