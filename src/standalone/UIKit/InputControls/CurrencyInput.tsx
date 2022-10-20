import React, { useCallback, useEffect, useState } from "react";
import { TextFieldProps } from "@material-ui/core";
import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../TextFieldWithHelp";
import { parseLocalizedNumber } from "../../../utils";
import useCCTranslations from "../../../utils/useCCTranslations";

export interface CurrencyInputProps extends TextFieldWithHelpProps {
	/**
	 * The currency to be used in formatting
	 */
	currency: string;
	/**
	 * The current value or null if not set
	 */
	value: number | null;
	/**
	 * The change event handler
	 * @param evt
	 * @param value
	 */
	onChange?: (
		evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
		value: number | null
	) => void;
}

const CurrencyInput = (
	props: CurrencyInputProps & Omit<TextFieldProps, "onChange" | "value">
) => {
	const { value, onChange, onBlur, currency, ...muiProps } = props;
	const { i18n } = useCCTranslations();
	const formatNumber = useCallback(
		(value: number | null) =>
			value != null
				? value.toLocaleString(i18n.language, {
						style: "currency",
						currency,
				  })
				: "",
		[currency, i18n.language]
	);
	const valueFormatted = formatNumber(value);
	const [valueInternal, setValueInternal] = useState(valueFormatted);
	useEffect(() => setValueInternal(formatNumber(value)), [formatNumber, value]);
	const [lastChangeEvent, setLastChangeEvent] = useState<React.ChangeEvent<
		HTMLTextAreaElement | HTMLInputElement
	> | null>(null);
	const [error, setError] = useState(false);

	// on change handling
	const handleChange = useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			if (!onChange) return;
			setValueInternal(event.target.value);
			event.persist();
			setLastChangeEvent(event);
		},
		[onChange]
	);

	const handleBlur = useCallback(
		(evt: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			if (onBlur) onBlur(evt);
			if (lastChangeEvent) {
				const value = parseLocalizedNumber(valueInternal);
				if (value != null && isNaN(value)) {
					setError(true);
				} else if (onChange) {
					setError(false);
					const formatted = formatNumber(value);
					// we parse here so decimal points are limited and view always matches data
					onChange(lastChangeEvent, parseLocalizedNumber(formatted));
				}
			}
		},
		[formatNumber, lastChangeEvent, onBlur, onChange, valueInternal]
	);

	// component rendering
	return (
		<div>
			<TextFieldWithHelp
				{...muiProps}
				value={valueInternal}
				onChange={handleChange}
				onBlur={handleBlur}
				error={error || muiProps.error}
			/>
		</div>
	);
};

export default React.memo(CurrencyInput);
