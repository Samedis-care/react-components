import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useMemo } from "react";
import { DateTimePicker, LocalizationProvider, } from "@mui/x-date-pickers";
import { withMuiFieldState } from "../UIKit";
import useMuiLocaleData from "./useMuiLocaleData";
import accessSlotProps from "../../utils/internal/accessSlotProps";
import usePickerDraft from "./usePickerDraft";
import usePickerValidationError from "./usePickerValidationError";
import withAccessibleError from "./withAccessibleError";
import withRequiredSections from "./withRequiredSections";
import useFieldBlur from "./useFieldBlur";
import withFieldName from "./withFieldName";
import withReportWhenDone from "./withReportWhenDone";
import calendarNameSlotProps from "./calendarNameSlotProps";
import calendarFocusRingSlotProps from "./calendarFocusRingSlotProps";
import OpenPickerButton from "./OpenPickerButton";
/**
 * When the picker opens its desktop popup rather than MUI's mobile dialog: with
 * a fine pointer, as in MUI, and only where the popup fits. The popup puts the
 * 320px calendar next to the time columns, up to 545px wide with seconds and
 * AM/PM, so a narrow window or a zoomed-in page would scroll sideways; 600px
 * leaves room for a scrollbar. The mobile dialog fits a 320px viewport.
 */
const DESKTOP_MODE_MEDIA_QUERY = "@media (pointer: fine) and (min-width: 600px)";
const LocalizedDateTimePicker = (props) => {
    const { required, error, fullWidth, onBlur, publishIntermediateValues, "aria-label": ariaLabel, ...otherProps } = props;
    const localeText = useMuiLocaleData();
    const draft = usePickerDraft(otherProps.value, otherProps.onChange, publishIntermediateValues, otherProps.defaultValue);
    const validation = usePickerValidationError(otherProps.onError);
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
    return (_jsx(LocalizationProvider, { localeText: localeText, children: _jsx(DateTimePicker, { format: "L LT", ...otherProps, value: draft.value, onChange: draft.onChange, onOpen: handleOpen, onAccept: handleAccept, onError: validation.onError, desktopModeMediaQuery: otherProps.desktopModeMediaQuery ?? DESKTOP_MODE_MEDIA_QUERY, slots: slots, slotProps: {
                ...otherProps.slotProps,
                ...calendarNameSlotProps(otherProps.slotProps, {
                    name: ariaLabel,
                    hasLabel: !!otherProps.label,
                    fallbackName: otherProps.localeText?.toolbarTitle ??
                        localeText?.dateTimePickerToolbarTitle,
                }),
                ...calendarFocusRingSlotProps(otherProps.slotProps),
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
                            orgSlotProps?.onBlur?.(event);
                            onBlur?.(event);
                        },
                    }));
                    return withFieldBlur(ownerState, withFieldName(withReportWhenDone(fieldProps, draft), ariaLabel), {
                        name: otherProps.name,
                    });
                },
            } }) }));
};
export default React.memo(withMuiFieldState(LocalizedDateTimePicker));
