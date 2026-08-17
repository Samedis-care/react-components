import React, { useCallback } from "react";
import {
	DatePicker,
	DatePickerProps,
	LocalizationProvider,
} from "@mui/x-date-pickers";
import { TextFieldProps, useThemeProps } from "@mui/material";
import type { PickersTextFieldProps } from "@mui/x-date-pickers";
import { withMuiWarning } from "../UIKit/MuiWarning";
import useMuiLocaleData from "./useMuiLocaleData";
import accessSlotProps from "../../utils/internal/accessSlotProps";
import { TextFieldWithHelpProps } from "../UIKit/TextFieldWithHelp";
import usePickerDraft from "./usePickerDraft";

export interface LocalizedKeyboardDatePickerProps
	extends
		Omit<DatePickerProps, "format">,
		Pick<TextFieldWithHelpProps, "disableClearable"> {
	/**
	 * Boolean flag to hide Calendar Icon (only used if disabled is truthy)
	 */
	hideDisabledIcon?: boolean;
	/**
	 * Set required flag for text field input
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
						return {
							...textFieldProps,
							required,
							error,
							fullWidth,
							onBlur: (event: React.FocusEvent<HTMLInputElement>) => {
								draft.settleOnBlur(event);
								onBlur?.(event);
							},
							disableClearable,
						} as unknown as Partial<PickersTextFieldProps>;
					},
				}}
			/>
		</LocalizationProvider>
	);
};

export default React.memo(withMuiWarning(LocalizedKeyboardDatePicker));
