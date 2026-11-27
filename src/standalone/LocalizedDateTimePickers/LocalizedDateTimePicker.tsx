// MUI types every date of the props as its PickerValidDate, which stays `any`
// in a program that loads no date adapter's types. This loads AdapterMoment's,
// and keeps the reference in the declaration file the library ships, so an
// app that imports the picker gets its dates typed as Moment.
/// <reference types="@mui/x-date-pickers/AdapterMoment" preserve="true" />
import React, { useCallback, useMemo, useState } from "react";
import {
	DateTimePicker,
	DateTimePickerProps,
	LocalizationProvider,
	PickersTextFieldProps,
	usePickerAdapter,
} from "@mui/x-date-pickers";
import type {
	DateTimeValidationError,
	PickerChangeHandlerContext,
	PickerValidDate,
} from "@mui/x-date-pickers";
import { MuiFieldStateProps, withMuiFieldState } from "../UIKit/MuiFieldState";
import { TextFieldProps } from "@mui/material";
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
import useDateTimeOpenPickerName from "./useDateTimeOpenPickerName";

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
 * Props of a date and time picker: MUI's `DateTimePicker`, whose field writes
 * the date and time as MUI's does, in the format for its `views` and `ampm`
 * in the adapter's locale (`L hh:mm A` or `L HH:mm` with moment for the
 * default views), or in `format`.
 *
 * While the picker's own validation rejects the date and time the field shows
 * (`minDate`, `maxDate`, `minDateTime`, `maxDateTime`, `minTime`, `maxTime`,
 * `minutesStep`, `disablePast`, `disableFuture`, `shouldDisableDate`,
 * `shouldDisableTime`, an impossible date such as 02/31), the field says why
 * in a message under it, in the components-care language: "Enter a time at or
 * after 09:00 AM", "Enter a date and time on or after 08/01/2026 10:00 AM". A
 * limit is written as the field writes it, a limit with a date in the
 * timezone the field shows. The message takes the place of
 * `slotProps.textField.helperText` and is the field's description. A
 * rejection that comes up while the user is in the field shows once focus
 * leaves it, so a year typed through 0002 does not flash it; one that comes up
 * while the user is elsewhere (a date set from outside, a changed `minTime`)
 * shows at once. It goes as soon as the value is valid. A caller that sets
 * `error` (also to `false`) decides the error state and its text itself, and
 * gets no message: to show a text of its own, set `error` from `onError` and
 * pass that text as `helperText`.
 *
 * Keyboard focus shows as a 2px ring in `palette.primary.main` on the button
 * that opens the calendar and on every control of the open calendar, the
 * desktop popup and the mobile dialog alike, where MUI shows only a faint
 * tint or a ripple (see `calendarFocusRingSlotProps`). When the theme sets
 * MUI's `focusVisible` ring, that ring is the one shown. The ring comes with
 * the default `slots.openPickerButton`, which a caller's own button replaces,
 * and goes into `slotProps.layout.sx`, which keeps a caller's layout slot
 * props and puts a caller's `sx` after it.
 *
 * Without `fullWidth` the field is as wide as its sections need, at least
 * MUI's 182px: where the date and time need more (with the user's text
 * spacing, WCAG 1.4.12, with seconds or a long `format`), the field grows
 * rather than cutting off their end behind the calendar button. With
 * `fullWidth` it takes the width of its container, as in MUI (see
 * `withFittingSections`).
 *
 * The button that opens the calendar is named after the date and the time the
 * field shows, in the components-care language: "Choose date and time,
 * selected date and time is Aug 1, 2026 10:30 AM", or "Choose date and time"
 * while the field is empty. MUI names it after the date alone. The name goes
 * into `slotProps.openPickerButton`, so it also names a caller's own
 * `slots.openPickerButton`, and an `aria-label` the caller sets there takes
 * its place.
 *
 * Every date the picker takes or reports is a `Moment`, or `null` for no
 * date: `value`, `defaultValue`, `referenceDate`, `minDate`, `maxDate`,
 * `minDateTime`, `maxDateTime`, `minTime`, `maxTime`, and the dates
 * `onChange`, `onAccept`, `shouldDisableDate` and `shouldDisableTime` get.
 * MUI types them as its `PickerValidDate`; importing the picker loads the
 * types of MUI's `AdapterMoment`, the adapter `Framework` provides, which
 * make that a `Moment` in the whole program, for MUI's own pickers too. The
 * `ref` is the field's root `div`.
 */
export interface LocalizedDateTimePickerProps extends DateTimePickerProps {
	/**
	 * How the field writes the date and time: a format string of the date
	 * adapter, such as `"YYYY-MM-DD HH:mm"` with moment. Default: MUI's for the
	 * `views` and `ampm`, in the adapter's locale: with moment and the default
	 * views `L hh:mm A` on a 12-hour clock (`08/01/2026 03:30 PM` in English)
	 * and `L HH:mm` on a 24-hour one (`01.08.2026 15:30` in German), with
	 * seconds when `views` has them. The picker's message writes its limits
	 * with a date and a time in it too.
	 */
	format?: DateTimePickerProps["format"];
	/**
	 * Whether the time is on a 12-hour clock with AM/PM, in the field and in
	 * the calendar's time columns. Default: the clock of the adapter's locale
	 * (12 hours in English, 24 in German), as in MUI. The picker's message
	 * writes its time limits on the same clock.
	 */
	ampm?: DateTimePickerProps["ampm"];
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
	 * Lets the field fill the width of its container. Without it the field is
	 * as wide as its sections need, at least MUI's 182px for them. When set,
	 * also to `false`, it takes precedence over `slotProps.textField.fullWidth`;
	 * leave it undefined to use that (MUI's default: `false`).
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
	 * Called with every date reported to `onChange`, right after it and with
	 * the same arguments: once the user is done with the date (see `onChange`),
	 * with a date the picker accepts or `null` for an empty field. Unlike MUI's
	 * `onAccept`, it is not called for every change of the field, so it gets
	 * neither the dates the field passes through while the user types (the
	 * years 0002, 0020 and 0203 on the way to 2030) nor an entry the picker
	 * rejects (see `onError`). With `publishIntermediateValues` it is MUI's
	 * `onAccept`: called for every change of the field and for a date the
	 * calendar accepts, entries the picker rejects included, with their reason
	 * in `context.validationError`.
	 * @param value The date, or `null`
	 * @param context MUI's context: `validationError` (`null`, the date being
	 * accepted) and `source`
	 */
	onAccept?: DateTimePickerProps["onAccept"];
	/**
	 * Report every change at once, rather than a date once the user is done
	 * with it (see `onChange`): every keystroke, entries the picker rejects
	 * included, to `onChange` and `onAccept`, as MUI's own picker does. Default
	 * `false`. See {@link usePickerDraft}.
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

const LocalizedDateTimePicker = (
	props: LocalizedDateTimePickerProps,
	ref: React.ForwardedRef<HTMLDivElement>,
) => {
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
		otherProps.onAccept,
	);
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
		timezone:
			otherProps.timezone ||
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
	const [uncontrolledValue, setUncontrolledValue] = useState<
		PickerValidDate | null | undefined
	>(() => otherProps.defaultValue);
	const { onChange: draftOnChange } = draft;
	const handleChange = useCallback(
		(
			value: PickerValidDate | null,
			context: PickerChangeHandlerContext<DateTimeValidationError>,
		) => {
			if (!isControlled) setUncontrolledValue(value);
			draftOnChange(value, context);
		},
		[isControlled, draftOnChange],
	);
	const openPickerName = useDateTimeOpenPickerName(
		isControlled ? draft.value : uncontrolledValue,
		otherProps.timezone,
	);

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
			<DateTimePicker
				{...otherProps}
				ref={ref}
				value={draft.value}
				onChange={handleChange}
				onOpen={handleOpen}
				// reports a date the calendar accepted at once, and passes what is
				// reported to the caller's onAccept, see onAccept
				onAccept={draft.accept}
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
					// MUI names the button after the date alone; an aria-label the
					// caller gives comes after this one and wins
					openPickerButton: (ownerState) => ({
						"aria-label": openPickerName,
						...accessSlotProps(
							ownerState,
							otherProps.slotProps?.openPickerButton,
						),
					}),
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
									validation.onFieldLeave();
									orgSlotProps?.onBlur?.(event);
									onBlur?.(event);
								},
							}),
							errorMessage,
						);
						return withFieldBlur(
							ownerState,
							withFieldName(
								withFittingSections(withReportWhenDone(fieldProps, draft)),
								ariaLabel,
							),
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

// withMuiFieldState hands the ref on to the picker, and the picker to MUI's,
// which puts it on the field's root div, but it types its result as a plain
// component type, whose ref would be a class instance
const LocalizedDateTimePickerWithFieldState = withMuiFieldState(
	React.forwardRef(LocalizedDateTimePicker),
) as React.ForwardRefExoticComponent<
	LocalizedDateTimePickerProps &
		MuiFieldStateProps &
		React.RefAttributes<HTMLDivElement>
>;

export default React.memo(LocalizedDateTimePickerWithFieldState);
