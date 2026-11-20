import React, { useCallback, useMemo } from "react";
import {
	DatePicker,
	DatePickerProps,
	LocalizationProvider,
} from "@mui/x-date-pickers";
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
import calendarNameSlotProps from "./calendarNameSlotProps";
import calendarFocusRingSlotProps from "./calendarFocusRingSlotProps";
import OpenPickerButton from "./OpenPickerButton";

/**
 * Props of a date picker (MUI's `DatePicker` with the `L` format of the
 * current language).
 *
 * While the picker's own validation rejects the date the field shows
 * (`minDate`, `maxDate`, `disablePast`, `disableFuture`, `shouldDisableDate`,
 * an impossible date such as 02/31), the field says why in a message under it,
 * in the components-care language: "Enter a date on or after 01/01/2020". The
 * message takes the place of `slotProps.textField.helperText` and is the
 * field's description. A rejection that comes up while the user is in the
 * field shows once focus leaves it, so a year typed through 0002 does not
 * flash it; one that comes up while the user is elsewhere (a date set from
 * outside, a changed `minDate`) shows at once. It goes as soon as the date is
 * valid. A caller that sets `slotProps.textField.error` (also to `false`)
 * decides the error state and its text itself, and gets no message: to show
 * a text of its own, set `error` from `onError` and pass that text as
 * `helperText`.
 *
 * Keyboard focus shows as a 2px ring in `palette.primary.main` on the button
 * that opens the calendar and on every control of the open calendar, the
 * desktop popup and the mobile dialog alike, where MUI shows only a faint
 * tint or a ripple (see `calendarFocusRingSlotProps`). When the theme sets
 * MUI's `focusVisible` ring, that ring is the one shown. The ring comes with
 * the default `slots.openPickerButton`, which a caller's own button replaces,
 * and goes into `slotProps.layout.sx`, which keeps a caller's layout slot
 * props and puts a caller's `sx` after it.
 */
export interface LocalizedDatePickerProps extends Omit<
	DatePickerProps,
	"format"
> {
	/**
	 * Report every keystroke, rather than only dates the user finished entering.
	 * See {@link usePickerDraft}.
	 */
	publishIntermediateValues?: boolean;
	/**
	 * The accessible name of the picker, for a picker without a visible
	 * `label`, such as the translated purpose of the date ("From", "To"). It
	 * names the field (its `role="group"`, which a screen reader announces when
	 * focus enters a section) and the open calendar dialog: the desktop popup
	 * and the mobile dialog, also while the mobile dialog shows its title
	 * ("Select date"). A visible `label` takes its place, as in MUI: the label
	 * names the field and the desktop popup, and the mobile dialog's title
	 * names the mobile dialog. Default: none. A picker with neither has an
	 * unnamed field, and its calendar is named after MUI's title of the mobile
	 * dialog, "Select date".
	 */
	"aria-label"?: string;
}

const LocalizedDatePicker = (props: LocalizedDatePickerProps) => {
	const {
		publishIntermediateValues,
		"aria-label": ariaLabel,
		...otherProps
	} = props;
	const localeText = useMuiLocaleData();
	const draft = usePickerDraft(
		otherProps.value,
		otherProps.onChange,
		publishIntermediateValues,
	);
	const validation = usePickerValidationError(otherProps.onError);
	const errorMessage = usePickerErrorMessage(validation.shownError, {
		minDate: otherProps.minDate,
		maxDate: otherProps.maxDate,
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
	const consumerSlots = otherProps.slots;
	// the caller's slots come after the open button with its focus ring, so a
	// button it passes wins
	const slots = useMemo(
		() => ({ openPickerButton: OpenPickerButton, ...consumerSlots }),
		[consumerSlots],
	);

	return (
		<LocalizationProvider localeText={localeText}>
			<DatePicker
				format={"L"}
				{...otherProps}
				value={draft.value}
				onChange={draft.onChange}
				onOpen={handleOpen}
				onError={validation.onError}
				slots={slots}
				slotProps={{
					...otherProps.slotProps,
					...calendarNameSlotProps(otherProps.slotProps, {
						name: ariaLabel,
						hasLabel: !!otherProps.label,
						fallbackName:
							otherProps.localeText?.toolbarTitle ??
							localeText?.datePickerToolbarTitle,
					}),
					...calendarFocusRingSlotProps(otherProps.slotProps),
					textField: (ownerState) => {
						const orgSlotProps = accessSlotProps(
							ownerState,
							otherProps.slotProps?.textField,
						);
						const fieldProps = withAccessibleError(
							validation.hasValidationError,
							withRequiredSections({
								...orgSlotProps,
								// called once focus leaves the field, see withFieldBlur
								onBlur: (event: React.FocusEvent<HTMLDivElement>) => {
									validation.onFieldLeave();
									orgSlotProps?.onBlur?.(event);
								},
							}),
							errorMessage,
						);
						return withFieldBlur(
							ownerState,
							withFieldName(fieldProps, ariaLabel),
							{
								name: otherProps.name,
								onFieldFocus: validation.onFieldFocus,
							},
						);
					},
				}}
			/>
		</LocalizationProvider>
	);
};

export default React.memo(withMuiFieldState(LocalizedDatePicker));
