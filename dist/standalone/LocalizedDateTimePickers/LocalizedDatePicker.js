import { jsx as _jsx } from "react/jsx-runtime";
// MUI types every date of the props as its PickerValidDate, which stays `any`
// in a program that loads no date adapter's types. This loads AdapterMoment's,
// and keeps the reference in the declaration file the library ships, so an
// app that imports the picker gets its dates typed as Moment.
/// <reference types="@mui/x-date-pickers/AdapterMoment" preserve="true" />
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
import withFittingSections from "./withFittingSections";
import withReportWhenDone from "./withReportWhenDone";
import calendarNameSlotProps from "./calendarNameSlotProps";
import calendarFocusRingSlotProps from "./calendarFocusRingSlotProps";
import OpenPickerButton from "./OpenPickerButton";
import usePickerOpen from "./usePickerOpen";
const LocalizedDatePicker = (props, ref) => {
    const { publishIntermediateValues, "aria-label": ariaLabel, ...otherProps } = props;
    const localeText = useMuiLocaleData();
    const draft = usePickerDraft(otherProps.value, otherProps.onChange, publishIntermediateValues, otherProps.defaultValue, otherProps.onAccept);
    const validation = usePickerValidationError(otherProps.onError);
    const errorMessage = usePickerErrorMessage(validation.shownError, {
        minDate: otherProps.minDate,
        maxDate: otherProps.maxDate,
        format: otherProps.format,
    });
    const withFieldBlur = useFieldBlur();
    const { settle } = draft;
    const consumerOnOpen = otherProps.onOpen;
    const handleOpen = useCallback(() => {
        // the calendar renders from the value it is given, so a half-typed date
        // would open it on a year nothing is selectable in
        settle();
        consumerOnOpen?.();
    }, [settle, consumerOnOpen]);
    // closes the calendar when the picker gets disabled or read-only
    const openState = usePickerOpen({
        open: otherProps.open,
        onOpen: handleOpen,
        onClose: otherProps.onClose,
        // reports the date picked in the calendar, as a click outside does
        onDismiss: draft.finish,
        disabled: otherProps.disabled,
        readOnly: otherProps.readOnly,
    });
    const consumerSlots = otherProps.slots;
    // the caller's slots come after the open button with its focus ring, so a
    // button it passes wins
    const slots = useMemo(() => ({ openPickerButton: OpenPickerButton, ...consumerSlots }), [consumerSlots]);
    return (_jsx(LocalizationProvider, { localeText: localeText, children: _jsx(DatePicker, { ...otherProps, ref: ref, value: draft.value, onChange: draft.onChange, open: openState.open, onOpen: openState.onOpen, onClose: openState.onClose, 
            // reports a date the calendar accepted at once, and passes what is
            // reported to the caller's onAccept, see onAccept
            onAccept: draft.accept, onError: validation.onError, slots: slots, slotProps: {
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
                    return withFieldBlur(ownerState, withFieldName(withFittingSections(withReportWhenDone(fieldProps, draft)), ariaLabel), {
                        name: otherProps.name,
                        onFieldFocus: validation.onFieldFocus,
                    });
                },
            } }) }));
};
// withMuiFieldState hands the ref on to the picker, and the picker to MUI's,
// which puts it on the field's root div, but it types its result as a plain
// component type, whose ref would be a class instance
const LocalizedDatePickerWithFieldState = withMuiFieldState(React.forwardRef(LocalizedDatePicker));
export default React.memo(LocalizedDatePickerWithFieldState);
