import React, { useCallback, useMemo } from "react";
import {
	DatePicker,
	DatePickerProps,
	LocalizationProvider,
} from "@mui/x-date-pickers";
import { TextFieldProps, useThemeProps } from "@mui/material";
import { withMuiFieldState } from "../UIKit/MuiFieldState";
import useMuiLocaleData from "./useMuiLocaleData";
import accessSlotProps from "../../utils/internal/accessSlotProps";
import { TextFieldWithHelpProps } from "../UIKit/TextFieldWithHelp";
import usePickerDraft from "./usePickerDraft";
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

/**
 * Props of a date picker typed into with the keyboard (MUI's `DatePicker`
 * with the `L` format of the current language).
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
 * valid. A caller that sets `error` (also to `false`) decides the error state
 * and its text itself, and gets no message: to show a text of its own, set
 * `error` from `onError` and pass that text as `helperText`.
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
export interface LocalizedKeyboardDatePickerProps
	extends
		Omit<DatePickerProps, "format">,
		Pick<TextFieldWithHelpProps, "disableClearable"> {
	/**
	 * Boolean flag to hide Calendar Icon (only used if disabled is truthy)
	 */
	hideDisabledIcon?: boolean;
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
	/**
	 * Marks the field required: an asterisk after the label, `required` on the
	 * hidden input and `aria-required` on every section, so screen readers
	 * announce it. When set, also to `false`, it takes precedence over
	 * `slotProps.textField.required`; leave it undefined to use that.
	 */
	required?: TextFieldProps["required"];
	/**
	 * Forces the error state of the field: red outline and label, and
	 * `aria-invalid` on the field group and on every section, so a screen reader
	 * announces it while the user types. When set, also to `false`, it replaces
	 * the picker's own validation state, which is used while it is undefined,
	 * and with it the picker's own message under the field. Takes precedence
	 * over `slotProps.textField.error` when set.
	 */
	error?: TextFieldProps["error"];
	/**
	 * Set error flag for text field input
	 */
	fullWidth?: TextFieldProps["fullWidth"];
	/**
	 * Called once focus leaves the field: from a section, the open-picker button,
	 * another adornment or the open calendar to anything outside the field and
	 * its open calendar (a click on another control while the calendar is open
	 * counts). Moving between those is not leaving. Receives a blur event of the
	 * field's input root (`role="group"`), which carries `name` as `data-name`,
	 * so Form's `handleBlur` can be passed as it is; `target` is the element that
	 * lost focus, also one in the calendar.
	 */
	onBlur?: TextFieldProps["onBlur"];
	/**
	 * Called once the user is done with the date: when focus leaves the field
	 * (right before `onBlur`), on Enter in the field, and when the calendar
	 * accepts a date (a day picked in the desktop calendar, OK in the mobile
	 * dialog, or the calendar closed with Escape or a click outside it, which
	 * keeps the date picked in it, as in MUI). It gets the date the field
	 * shows, if the picker accepts it, or `null` for an empty field, and only if
	 * that differs from the date reported last or handed in as `value` since.
	 * Not reported are the dates the field passes through while the user types
	 * (a half-typed year, the dates on the way while a day, month or year is
	 * retyped, the `null` of a section deleted to retype it), an entry the
	 * picker rejects (see `onError`), and a day picked in the mobile dialog
	 * until OK; Cancel there reports nothing. So a form, its dirty state and its
	 * save button see a typed date once the user leaves the field or presses
	 * Enter. Moving to a button of the field (the open-picker button, an
	 * adornment) is not leaving it. With `publishIntermediateValues` it is
	 * called for every change instead.
	 * @param value The date, or `null`
	 * @param context MUI's context: `validationError` (`null`, the date being
	 * accepted) and `source`
	 */
	onChange?: DatePickerProps["onChange"];
	/**
	 * Report every change at once, rather than a date once the user is done
	 * with it (see `onChange`): every keystroke, entries the picker rejects
	 * included, as MUI's own picker does. Default `false`. See
	 * {@link usePickerDraft}.
	 */
	publishIntermediateValues?: boolean;
}

export type LocalizedKeyboardDatePickerClassKey = never;

const NoIcon = () => {
	return <></>;
};

const LocalizedKeyboardDatePicker = (
	inProps: LocalizedKeyboardDatePickerProps,
) => {
	const props = useThemeProps({
		props: inProps,
		name: "CcLocalizedKeyboardDatePicker",
	});
	const {
		hideDisabledIcon,
		required,
		error,
		fullWidth,
		onBlur,
		disableClearable,
		publishIntermediateValues,
		"aria-label": ariaLabel,
		...otherProps
	} = props;
	const hideIcon = !!otherProps.disabled && !!hideDisabledIcon;
	const consumerSlots = otherProps.slots;
	// the caller's slots come after the open button with its focus ring, so a
	// button it passes wins
	const slots = useMemo(
		() => ({
			openPickerButton: OpenPickerButton,
			...consumerSlots,
			...(hideIcon && { openPickerIcon: NoIcon }),
		}),
		[consumerSlots, hideIcon],
	);
	const localeText = useMuiLocaleData();
	const draft = usePickerDraft(
		otherProps.value,
		otherProps.onChange,
		publishIntermediateValues,
		otherProps.defaultValue,
	);
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
	const handleAccept: NonNullable<DatePickerProps["onAccept"]> = useCallback(
		(value, context) => {
			// a date the calendar accepted is reported at once, see onChange
			accept(value, context);
			consumerOnAccept?.(value, context);
		},
		[accept, consumerOnAccept],
	);

	return (
		<LocalizationProvider localeText={localeText}>
			<DatePicker
				format={"L"}
				{...otherProps}
				value={draft.value}
				onChange={draft.onChange}
				onOpen={handleOpen}
				onAccept={handleAccept}
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
						const textFieldProps = accessSlotProps(
							ownerState,
							otherProps.slotProps?.textField,
						);
						const fieldProps = withAccessibleError(
							validation.hasValidationError,
							withRequiredSections({
								...textFieldProps,
								// only where the caller actually gave one, so a value passed
								// through slotProps.textField is not overwritten with undefined
								...(required === undefined ? {} : { required }),
								...(error === undefined ? {} : { error }),
								...(fullWidth === undefined ? {} : { fullWidth }),
								// called once focus leaves the field, see withFieldBlur
								onBlur: (event: React.FocusEvent<HTMLInputElement>) => {
									validation.onFieldLeave();
									textFieldProps?.onBlur?.(event);
									onBlur?.(event);
								},
								// disableClearable suppresses the clear button that our
								// TextFieldWithHelp based fields render on touch devices. It is
								// sent only when the caller set it, so a text field swapped in
								// for ours is not handed a prop it would pass on to the DOM.
								...(disableClearable === undefined ? {} : { disableClearable }),
							}),
							errorMessage,
						);
						return withFieldBlur(
							ownerState,
							withFieldName(withReportWhenDone(fieldProps, draft), ariaLabel),
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

export default React.memo(withMuiFieldState(LocalizedKeyboardDatePicker));
