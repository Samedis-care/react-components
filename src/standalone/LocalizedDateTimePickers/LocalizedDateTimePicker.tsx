import React, { useCallback } from "react";
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
import withRequiredSections from "./withRequiredSections";

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
	 * Set error flag for text field input
	 */
	error?: TextFieldProps["error"];
	/**
	 * Set error flag for text field input
	 */
	fullWidth?: TextFieldProps["fullWidth"];
	/**
	 * onBlur callback for the text field input
	 */
	onBlur?: TextFieldProps["onBlur"] & PickersTextFieldProps["onBlur"];
	/**
	 * Report every keystroke, rather than only dates the user finished entering.
	 * See {@link usePickerDraft}.
	 */
	publishIntermediateValues?: boolean;
}

const LocalizedDateTimePicker = (props: LocalizedDateTimePickerProps) => {
	const {
		required,
		error,
		fullWidth,
		onBlur,
		publishIntermediateValues,
		...otherProps
	} = props;
	const localeText = useMuiLocaleData();
	const draft = usePickerDraft(
		otherProps.value,
		otherProps.onChange,
		publishIntermediateValues,
	);

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
			<DateTimePicker
				format={"L LT"}
				{...otherProps}
				value={draft.value}
				onChange={draft.onChange}
				onOpen={handleOpen}
				slotProps={{
					...otherProps.slotProps,
					textField: (ownerState) => {
						const orgSlotProps = accessSlotProps(
							ownerState,
							otherProps.slotProps?.textField,
						);
						return withRequiredSections({
							...orgSlotProps,
							// only where the caller actually gave one, so a value passed
							// through slotProps.textField is not overwritten with undefined
							...(required === undefined ? {} : { required }),
							...(error === undefined ? {} : { error }),
							...(fullWidth === undefined ? {} : { fullWidth }),
							onBlur: (event: React.FocusEvent<HTMLDivElement>) => {
								draft.settleOnBlur(event);
								orgSlotProps?.onBlur?.(event);
								onBlur?.(event);
							},
						});
					},
				}}
			/>
		</LocalizationProvider>
	);
};

export default React.memo(withMuiFieldState(LocalizedDateTimePicker));
