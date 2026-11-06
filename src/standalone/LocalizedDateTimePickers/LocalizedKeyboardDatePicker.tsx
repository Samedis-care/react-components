import React, { useCallback } from "react";
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
import withAccessibleError from "./withAccessibleError";
import withRequiredSections from "./withRequiredSections";
import withFieldBlur from "./withFieldBlur";

export interface LocalizedKeyboardDatePickerProps
	extends
		Omit<DatePickerProps, "format">,
		Pick<TextFieldWithHelpProps, "disableClearable"> {
	/**
	 * Boolean flag to hide Calendar Icon (only used if disabled is truthy)
	 */
	hideDisabledIcon?: boolean;
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
	 * Called once focus leaves the field: from a section, the open-picker button
	 * or another adornment to anything outside the field and its open popup.
	 * Moving between those is not leaving. Focus that leaves from inside the open
	 * popup (a click on another control while the calendar is open) is not
	 * reported. Receives the blur event of the field's input root
	 * (`role="group"`); `target` is the element that lost focus.
	 */
	onBlur?: TextFieldProps["onBlur"];
	/**
	 * Report every keystroke, rather than only dates the user finished entering.
	 * See {@link usePickerDraft}.
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
		...otherProps
	} = props;
	const slotOverrideHideIcon = {
		...otherProps.slots,
		openPickerIcon: NoIcon,
	};
	const localeText = useMuiLocaleData();
	const draft = usePickerDraft(
		otherProps.value,
		otherProps.onChange,
		publishIntermediateValues,
	);
	const validation = usePickerValidationError(otherProps.onError);

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
				slots={
					otherProps.disabled && hideDisabledIcon
						? slotOverrideHideIcon
						: otherProps.slots
				}
				slotProps={{
					...otherProps.slotProps,
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
									draft.settle();
									textFieldProps?.onBlur?.(event);
									onBlur?.(event);
								},
								// disableClearable suppresses the clear button that our
								// TextFieldWithHelp based fields render on touch devices. MUI's
								// own PickersTextField has no such button and forwards the prop
								// it does not know to the DOM, so it is only sent on to a text
								// field that was actually swapped in for it.
								...(otherProps.slots?.textField ? { disableClearable } : {}),
							}),
						);
						return withFieldBlur(ownerState, fieldProps);
					},
				}}
			/>
		</LocalizationProvider>
	);
};

export default React.memo(withMuiFieldState(LocalizedKeyboardDatePicker));
