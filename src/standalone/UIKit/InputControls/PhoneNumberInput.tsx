import React, { useCallback, useState } from "react";
import parsePhoneNumberFromString, { CountryCode } from "libphonenumber-js";
import { TextFieldProps } from "@material-ui/core";
import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../TextFieldWithHelp";
import { UIInputProps } from "../CommonStyles";
import ccI18n from "../../../i18n";

export interface PhoneNumberInputProps<T> extends UIInputProps {
	/**
	 * The CountryCode for formatting phone number
	 */
	countryCode: CountryCode;
	/**
	 * Callback method to set entered value
	 */
	setValue: (value: string) => void;
	/**
	 * Callbakc method to return formatted value
	 */
	getValue: (num: string) => void;
	/**
	 * The entered/default value of textfield
	 */
	value?: T;
	onChange?: (newValue: T) => void;
	onBlur?: React.FocusEventHandler;
}

const PhoneNumberInput = (
	props: PhoneNumberInputProps<string | null> &
		TextFieldWithHelpProps &
		TextFieldProps
) => {
	const {
		value,
		getValue,
		setValue,
		infoText,
		important,
		countryCode,
		...muiProps
	} = props;
	const [error, setError] = useState(false);

	const handleChange = useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			let valid = true;
			let phoneNumber = event.target.value.replace(/[^0-9]/g, "");
			getValue(phoneNumber);
			const newPhoneNumber = parsePhoneNumberFromString(
				phoneNumber,
				countryCode
			);
			if (newPhoneNumber) {
				valid = newPhoneNumber.isValid();
				if (valid) phoneNumber = newPhoneNumber.number as string;
			}
			setError(!valid);
			setValue(phoneNumber);
		},
		[countryCode, getValue, setValue]
	);

	return (
		<div>
			<TextFieldWithHelp
				{...muiProps}
				autoFocus
				important={important}
				value={value}
				onFocus={handleChange}
				onChange={handleChange}
				error={!!error}
				helperText={error && ccI18n.t("standalone.phone-number.invalid")}
				infoText={infoText}
			/>
		</div>
	);
};

export default React.memo(PhoneNumberInput);
