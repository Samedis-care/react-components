import React, { useState } from "react";
import parsePhoneNumberFromString, { CountryCode } from "libphonenumber-js";
import { TextFieldProps } from "@material-ui/core";
import TextFieldWithHelp from "../TextFieldWithHelp";
import { UIInputProps } from "../CommonStyles";

export interface PhoneNumberInputProps extends UIInputProps {
	infoText?: React.ReactNode;
	important?: boolean;
	countryCode?: CountryCode;
}

const PhoneNumberInput = (props: PhoneNumberInputProps & TextFieldProps) => {
	const { infoText, important, countryCode, ...muiProps } = props;
	const [number, setNumber] = useState("");
	const [error, setError] = useState(false);

	const onChange = (event: React.ChangeEvent<{ value: unknown }>) => {
		let valid = true;
		let phoneNumber = event.target.value as string;
		const newPhoneNumber = parsePhoneNumberFromString(
			phoneNumber,
			countryCode || "DE"
		);

		if (newPhoneNumber) {
			valid = newPhoneNumber.isValid();
			if (valid) phoneNumber = newPhoneNumber.number as string;
		}

		setError(!valid);
		setNumber(phoneNumber);
	};

	return (
		<div>
			<TextFieldWithHelp
				{...muiProps}
				autoFocus
				important={important}
				value={number}
				onChange={onChange}
				error={!!error}
				helperText={error && "Enter correct phone number"}
				infoText={infoText}
			/>
		</div>
	);
};

export default React.memo(PhoneNumberInput);
