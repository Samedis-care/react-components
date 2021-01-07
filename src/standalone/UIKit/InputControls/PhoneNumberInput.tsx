import React, { useCallback, useState } from "react";
import parsePhoneNumberFromString, { CountryCode } from "libphonenumber-js";
import { TextFieldProps } from "@material-ui/core";
import TextFieldWithHelp from "../TextFieldWithHelp";
import { UIInputProps } from "../CommonStyles";

export interface PhoneNumberInputProps extends UIInputProps {
	/**
	 * The text for info icon
	 */
	infoText?: React.ReactNode;
	/**
	 * The text for info icon
	 */
	important?: boolean;
	/**
	 * The CountryCode for formatting phone number
	 */
	countryCode?: CountryCode;
	/**
	 * Callback method to set entered value
	 */
	setValue: (value: string) => void;
	/**
	 * Callbakc method to return formatted value
	 */
	getValue: (num: number) => void;
}

const PhoneNumberInput = (props: PhoneNumberInputProps & TextFieldProps) => {
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

	const updateValue = useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			let valid = true;
			let phoneNumber = event.target.value.replace(/[^0-9]/g, "");
			const numericValue = Number(phoneNumber);
			const newPhoneNumber = parsePhoneNumberFromString(
				phoneNumber,
				countryCode || "DE"
			);
			if (newPhoneNumber) {
				valid = newPhoneNumber.isValid();
				if (valid) phoneNumber = newPhoneNumber.number as string;
			}
			setError(!valid);
			setValue(phoneNumber);
			getValue(numericValue);
		},
		[countryCode, getValue, setValue]
	);
	const handleChange = useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			return updateValue(event);
		},
		[updateValue]
	);

	return (
		<div>
			<TextFieldWithHelp
				{...muiProps}
				autoFocus
				important={important}
				value={value}
				onFocus={updateValue}
				onChange={handleChange}
				error={!!error}
				helperText={error && "Enter correct phone number"}
				infoText={infoText}
			/>
		</div>
	);
};

export default React.memo(PhoneNumberInput);
