import React, { useCallback, useMemo } from "react";
import {
	DateTimePicker,
	DateTimePickerProps,
	LocalizationProvider,
	PickersTextFieldProps,
} from "@mui/x-date-pickers";
import { withMuiFieldState } from "../UIKit";
import { TextFieldProps } from "@mui/material";
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
const DESKTOP_MODE_MEDIA_QUERY =
	"@media (pointer: fine) and (min-width: 600px)";

/**
 * Props of a date and time picker (MUI's `DateTimePicker` with the `L LT`
 * format of the current language).
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
export interface LocalizedDateTimePickerProps extends Omit<
	DateTimePickerProps,
	"format"
> {
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
	 * the picker's own validation state, which is used while it is undefined.
	 * Takes precedence over `slotProps.textField.error` when set.
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
	onBlur?: TextFieldProps["onBlur"] & PickersTextFieldProps["onBlur"];
	/**
	 * Called once the user is done with the date: when focus leaves the field
	 * (right before `onBlur`), on Enter in the field, and when the calendar
	 * accepts a date (OK in the desktop popup or the mobile dialog, or the
	 * calendar closed with Escape or a click outside it, which keeps the date
	 * picked in it, as in MUI). It gets the date the field shows, if the picker
	 * accepts it, or `null` for an empty field, and only if that differs from
	 * the date reported last or handed in as `value` since. Not reported are
	 * the dates the field passes through while the user types (a half-typed
	 * year, the dates on the way while a day, month, year, hour or minute is
	 * retyped, the `null` of a section deleted to retype it), an entry the
	 * picker rejects (see `onError`), and a day picked in the calendar until OK;
	 * Cancel in the mobile dialog reports nothing. So a form, its dirty state
	 * and its save button see a typed date once the user leaves the field or
	 * presses Enter. Moving to a button of the field (the open-picker button,
	 * an adornment) is not leaving it. With `publishIntermediateValues` it is
	 * called for every change instead.
	 * @param value The date, or `null`
	 * @param context MUI's context: `validationError` (`null`, the date being
	 * accepted) and `source`
	 */
	onChange?: DateTimePickerProps["onChange"];
	/**
	 * Report every change at once, rather than a date once the user is done
	 * with it (see `onChange`): every keystroke, entries the picker rejects
	 * included, as MUI's own picker does. Default `false`. See
	 * {@link usePickerDraft}.
	 */
	publishIntermediateValues?: boolean;
	/**
	 * The accessible name of the picker, for a picker without a visible
	 * `label`, such as the translated purpose of the date ("From", "To"). It
	 * names the field (its `role="group"`, which a screen reader announces when
	 * focus enters a section) and the open calendar dialog: the desktop popup
	 * and the mobile dialog, also while the mobile dialog shows its title
	 * ("Select date & time"). A visible `label` takes its place, as in MUI:
	 * the label names the field and the desktop popup, and the mobile dialog's
	 * title names the mobile dialog. Default: none. A picker with neither has
	 * an unnamed field, and its calendar is named after MUI's title of the
	 * mobile dialog, "Select date & time".
	 */
	"aria-label"?: string;
	/**
	 * The CSS media query that selects the desktop popup; where it does not
	 * match, the picker opens MUI's mobile dialog. Defaults to
	 * `"@media (pointer: fine) and (min-width: 600px)"`: a fine pointer, as in
	 * MUI, on a viewport wide enough for the popup's calendar and time columns,
	 * so the popup never scrolls the page sideways.
	 */
	desktopModeMediaQuery?: DateTimePickerProps["desktopModeMediaQuery"];
}

const LocalizedDateTimePicker = (props: LocalizedDateTimePickerProps) => {
	const {
		required,
		error,
		fullWidth,
		onBlur,
		publishIntermediateValues,
		"aria-label": ariaLabel,
		...otherProps
	} = props;
	const localeText = useMuiLocaleData();
	const draft = usePickerDraft(
		otherProps.value,
		otherProps.onChange,
		publishIntermediateValues,
		otherProps.defaultValue,
	);
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
	const handleAccept: NonNullable<DateTimePickerProps["onAccept"]> =
		useCallback(
			(value, context) => {
				// a date the calendar accepted is reported at once, see onChange
				accept(value, context);
				consumerOnAccept?.(value, context);
			},
			[accept, consumerOnAccept],
		);
	const consumerSlots = otherProps.slots;
	// the caller's slots come after the open button with its focus ring, so a
	// button it passes wins
	const slots = useMemo(
		() => ({ openPickerButton: OpenPickerButton, ...consumerSlots }),
		[consumerSlots],
	);
	return (
		<LocalizationProvider localeText={localeText}>
			<DateTimePicker
				format={"L LT"}
				{...otherProps}
				value={draft.value}
				onChange={draft.onChange}
				onOpen={handleOpen}
				onAccept={handleAccept}
				onError={validation.onError}
				desktopModeMediaQuery={
					otherProps.desktopModeMediaQuery ?? DESKTOP_MODE_MEDIA_QUERY
				}
				slots={slots}
				slotProps={{
					...otherProps.slotProps,
					...calendarNameSlotProps(otherProps.slotProps, {
						name: ariaLabel,
						hasLabel: !!otherProps.label,
						fallbackName:
							otherProps.localeText?.toolbarTitle ??
							localeText?.dateTimePickerToolbarTitle,
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
								// only where the caller actually gave one, so a value passed
								// through slotProps.textField is not overwritten with undefined
								...(required === undefined ? {} : { required }),
								...(error === undefined ? {} : { error }),
								...(fullWidth === undefined ? {} : { fullWidth }),
								// called once focus leaves the field, see withFieldBlur
								onBlur: (event: React.FocusEvent<HTMLDivElement>) => {
									orgSlotProps?.onBlur?.(event);
									onBlur?.(event);
								},
							}),
						);
						return withFieldBlur(
							ownerState,
							withFieldName(withReportWhenDone(fieldProps, draft), ariaLabel),
							{
								name: otherProps.name,
							},
						);
					},
				}}
			/>
		</LocalizationProvider>
	);
};

export default React.memo(withMuiFieldState(LocalizedDateTimePicker));
