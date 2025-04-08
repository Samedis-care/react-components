import React, { useCallback, useEffect, useMemo, useState } from "react";
import { TextFieldProps } from "@mui/material";
import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../TextFieldWithHelp";
import parseLocalizedNumber from "../../../utils/parseLocalizedNumber";
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
		value: number | null,
	) => void;
}

const CurrencyInput = (
	props: CurrencyInputProps & Omit<TextFieldProps, "onChange" | "value">,
) => {
	const { value, onChange, onBlur, currency, ...muiProps } = props;
	const { i18n } = useCCTranslations();
	const numberFormatOptions: Intl.NumberFormatOptions = useMemo(
		() => ({
			style: "currency",
			currency,
		}),
		[currency],
	);
	const formatNumber = useCallback(
		(value: number | null) =>
			value != null
				? value.toLocaleString(i18n.language, numberFormatOptions)
				: "",
		[i18n.language, numberFormatOptions],
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
			if (!event.target.value) {
				onChange(event, null);
			}
		},
		[onChange],
	);

	const handleBlur = useCallback(
		(evt: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			if (onBlur) onBlur(evt);
			if (lastChangeEvent) {
				const value = parseLocalizedNumber(valueInternal, numberFormatOptions);
				if (value != null && isNaN(value)) {
					setError(true);
				} else if (onChange) {
					setError(false);
					const formatted = formatNumber(value);
					// we parse here so decimal points are limited and view always matches data
					onChange(
						lastChangeEvent,
						parseLocalizedNumber(formatted, numberFormatOptions),
					);
					setLastChangeEvent(null);
				}
			}
		},
		[
			formatNumber,
			lastChangeEvent,
			numberFormatOptions,
			onBlur,
			onChange,
			valueInternal,
		],
	);

	// component rendering
	return (
		<TextFieldWithHelp
			{...muiProps}
			value={lastChangeEvent ? valueInternal : valueFormatted}
			onChange={handleChange}
			onBlur={handleBlur}
			error={error || muiProps.error}
			inputProps={{
				...muiProps.inputProps,
				inputMode: "numeric",
			}}
			inputMode={"numeric"}
		/>
	);
};

export default React.memo(CurrencyInput);
