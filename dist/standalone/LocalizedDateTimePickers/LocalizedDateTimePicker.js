import { jsx as _jsx } from "react/jsx-runtime";
// MUI types every date of the props as its PickerValidDate, which stays `any`
// in a program that loads no date adapter's types. This loads AdapterMoment's,
// and keeps the reference in the declaration file the library ships, so an
// app that imports the picker gets its dates typed as Moment.
/// <reference types="@mui/x-date-pickers/AdapterMoment" preserve="true" />
import React, { useCallback, useMemo, useState } from "react";
import { DateTimePicker, LocalizationProvider, usePickerAdapter, } from "@mui/x-date-pickers";
import { withMuiFieldState } from "../UIKit/MuiFieldState";
import useMuiLocaleData from "./useMuiLocaleData";
import accessSlotProps from "../../utils/internal/accessSlotProps";
import usePickerDraft from "./usePickerDraft";
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
import useDateTimeOpenPickerName from "./useDateTimeOpenPickerName";
/**
 * When the picker opens its desktop popup rather than MUI's mobile dialog: with
 * a fine pointer, as in MUI, and only where the popup fits. The popup puts the
 * 320px calendar next to the time columns, up to 545px wide with seconds and
 * AM/PM, so a narrow window or a zoomed-in page would scroll sideways; 600px
 * leaves room for a scrollbar. The mobile dialog fits a 320px viewport.
 */
const DESKTOP_MODE_MEDIA_QUERY = "@media (pointer: fine) and (min-width: 600px)";
const LocalizedDateTimePicker = (props, ref) => {
    const { required, error, fullWidth, onBlur, publishIntermediateValues, "aria-label": ariaLabel, ...otherProps } = props;
    const localeText = useMuiLocaleData();
    const draft = usePickerDraft(otherProps.value, otherProps.onChange, publishIntermediateValues, otherProps.defaultValue, otherProps.onAccept);
    const validation = usePickerValidationError(otherProps.onError);
    const adapter = usePickerAdapter();
    const errorMessage = usePickerErrorMessage(validation.shownError, {
        minDate: otherProps.minDate,
        maxDate: otherProps.maxDate,
        minDateTime: otherProps.minDateTime,
        maxDateTime: otherProps.maxDateTime,
        minTime: otherProps.minTime,
        maxTime: otherProps.maxTime,
        minutesStep: otherProps.minutesStep,
        disablePast: otherProps.disablePast,
        disableFuture: otherProps.disableFuture,
        withTime: true,
        format: otherProps.format,
        ampm: otherProps.ampm,
        // the timezone the field shows the date in, as MUI picks it
        timezone: otherProps.timezone ||
            (draft.value
                ? adapter.getTimezone(draft.value)
                : otherProps.referenceDate
                    ? adapter.getTimezone(otherProps.referenceDate)
                    : "default"),
    });
    const withFieldBlur = useFieldBlur();
    // the date an uncontrolled picker shows, which MUI keeps: its defaultValue,
    // then each change it reports
    const isControlled = otherProps.value !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = useState(() => otherProps.defaultValue);
    const { onChange: draftOnChange } = draft;
    const handleChange = useCallback((value, context) => {
        if (!isControlled)
            setUncontrolledValue(value);
        draftOnChange(value, context);
    }, [isControlled, draftOnChange]);
    const openPickerName = useDateTimeOpenPickerName(isControlled ? draft.value : uncontrolledValue, otherProps.timezone);
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
    return (_jsx(LocalizationProvider, { localeText: localeText, children: _jsx(DateTimePicker, { ...otherProps, ref: ref, value: draft.value, onChange: handleChange, open: openState.open, onOpen: openState.onOpen, onClose: openState.onClose, 
            // reports a date the calendar accepted at once, and passes what is
            // reported to the caller's onAccept, see onAccept
            onAccept: draft.accept, onError: validation.onError, desktopModeMediaQuery: otherProps.desktopModeMediaQuery ?? DESKTOP_MODE_MEDIA_QUERY, slots: slots, slotProps: {
                ...otherProps.slotProps,
                ...calendarNameSlotProps(otherProps.slotProps, {
                    name: ariaLabel,
                    hasLabel: !!otherProps.label,
                    fallbackName: otherProps.localeText?.toolbarTitle ??
                        localeText?.dateTimePickerToolbarTitle,
                }),
                ...calendarFocusRingSlotProps(otherProps.slotProps),
                // MUI names the button after the date alone; an aria-label the
                // caller gives comes after this one and wins
                openPickerButton: (ownerState) => ({
                    "aria-label": openPickerName,
                    ...accessSlotProps(ownerState, otherProps.slotProps?.openPickerButton),
                }),
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
                            validation.onFieldLeave();
                            orgSlotProps?.onBlur?.(event);
                            onBlur?.(event);
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
const LocalizedDateTimePickerWithFieldState = withMuiFieldState(React.forwardRef(LocalizedDateTimePicker));
export default React.memo(LocalizedDateTimePickerWithFieldState);
