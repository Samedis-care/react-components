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
import useFieldBlur from "./useFieldBlur";
/**
 * When the picker opens its desktop popup rather than MUI's mobile dialog: with
 * a fine pointer, as in MUI, and only where the popup fits. The popup puts the
 * 320px calendar next to the time columns, up to 545px wide with seconds and
 * AM/PM, so a narrow window or a zoomed-in page would scroll sideways; 600px
 * leaves room for a scrollbar. The mobile dialog fits a 320px viewport.
 */
const DESKTOP_MODE_MEDIA_QUERY = "@media (pointer: fine) and (min-width: 600px)";
const LocalizedDateTimePicker = (props) => {
    const { required, error, fullWidth, onBlur, publishIntermediateValues, ...otherProps } = props;
    const localeText = useMuiLocaleData();
    const draft = usePickerDraft(otherProps.value, otherProps.onChange, publishIntermediateValues);
    const validation = usePickerValidationError(otherProps.onError);
    const withFieldBlur = useFieldBlur();
    const { settle } = draft;
    const consumerOnOpen = otherProps.onOpen;
    const handleOpen = useCallback(() => {
        // the calendar renders from the value it is given, so a half-typed date
        // would open it on a year nothing is selectable in
        settle();
        consumerOnOpen?.();
    }, [settle, consumerOnOpen]);
    return (_jsx(LocalizationProvider, { localeText: localeText, children: _jsx(DateTimePicker, { format: "L LT", ...otherProps, value: draft.value, onChange: draft.onChange, onOpen: handleOpen, onError: validation.onError, desktopModeMediaQuery: otherProps.desktopModeMediaQuery ?? DESKTOP_MODE_MEDIA_QUERY, slotProps: {
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
                            orgSlotProps?.onBlur?.(event);
                            onBlur?.(event);
                        },
                    }));
                    return withFieldBlur(ownerState, fieldProps);
                },
            } }) }));
};
export default React.memo(withMuiFieldState(LocalizedDateTimePicker));
