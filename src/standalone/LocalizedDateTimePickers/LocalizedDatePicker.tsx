import React, { useCallback } from "react";
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
import withFieldBlur from "./withFieldBlur";

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
}

const LocalizedDatePicker = (props: LocalizedDatePickerProps) => {
	const { publishIntermediateValues, ...otherProps } = props;
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

	const { settle } = draft;
	const consumerOnOpen = otherProps.onOpen;
	const handleOpen = useCallback(() => {
		// the calendar renders from the value it is given, so a half-typed date
		// would open it on a year nothing is selectable in
		settle();
		consumerOnOpen?.();
	}, [settle, consumerOnOpen]);

	return (
		<LocalizationProvider localeText={localeText}>
			<DatePicker
				format={"L"}
				{...otherProps}
				value={draft.value}
				onChange={draft.onChange}
				onOpen={handleOpen}
				onError={validation.onError}
				slotProps={{
					...otherProps.slotProps,
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
							fieldProps,
							validation.onFieldFocus,
						);
					},
				}}
			/>
		</LocalizationProvider>
	);
};

export default React.memo(withMuiFieldState(LocalizedDatePicker));
