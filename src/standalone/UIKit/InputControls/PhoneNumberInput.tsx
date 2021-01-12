import React, { useCallback, useState } from "react";
import parsePhoneNumberFromString, { CountryCode } from "libphonenumber-js";
import { TextFieldProps } from "@material-ui/core";
import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../TextFieldWithHelp";
import ccI18n from "../../../i18n";

export interface PhoneNumberInputProps extends TextFieldWithHelpProps {
	/**
	 * The CountryCode for formatting phone number
	 */
	countryCode: CountryCode;
	/**
	 * The current value or null if not set
	 */
	value: string;
	/**
	 * The change event handler
	 * @param evt
	 * @param value
	 */
	onChange?: (
		evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
		value: string
	) => void;
}

const PhoneNumberInput = (
	props: PhoneNumberInputProps & Omit<TextFieldProps, "onChange" | "value">
) => {
	const { onChange, countryCode, ...muiProps } = props;
	const [error, setError] = useState(false);
	const [phoneNumber, setPhoneNumber] = useState("");

	// on change handling
	const handleChange = useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			if (!onChange) return;

			let valid = true;
			let num = event.target.value.replace(/[^0-9]/g, "");
			if (num != "") {
				onChange(event, num);
				const newPhoneNumber = parsePhoneNumberFromString(num, countryCode);
				if (newPhoneNumber) {
					valid = newPhoneNumber.isValid();
					if (valid) num = newPhoneNumber.number as string;
				}
				setError(!valid);
			} else {
				onChange(event, "");
			}
			setPhoneNumber(num);
		},
		[countryCode, onChange]
	);

	// component rendering
	return (
		<div>
			<TextFieldWithHelp
				{...muiProps}
				value={phoneNumber}
				onFocus={handleChange}
				onChange={handleChange}
				error={!!error}
				helperText={error && ccI18n.t("standalone.phone-number.invalid")}
			/>
		</div>
	);
};

export default React.memo(PhoneNumberInput);
