import React, { useCallback, useEffect, useMemo, useState } from "react";
import { TextFieldProps } from "@mui/material";
import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../TextFieldWithHelp";
import parseLocalizedNumber from "../../../utils/parseLocalizedNumber";
import useCurrentLocale from "../../../utils/useCurrentLocale";
import useCCTranslations from "../../../utils/useCCTranslations";
import useCommitOnEnter from "../../../utils/internal/useCommitOnEnter";

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
	 * Called once on the blur after the user edited the text, with the amount
	 * rounded to the currency's minor units, or `null` for an emptied field
	 * (nothing but the currency symbol left counts as empty).
	 * Enter after an edit calls it too, before a form around the field submits:
	 * the field then shows the amount the parent keeps, as after a blur, and
	 * the next blur calls it only after a further edit.
	 * Typing does not call it, emptying the field and the touch Clear button
	 * included, and neither does a blur or Enter without an edit. `onBlur`, if
	 * given, runs first on a blur. Not called when the text is no number
	 * (`"abc"`, `"-"`, `"."`): the field keeps the previous amount and shows a
	 * message in place of `helperText` until a valid edit or a new `value`,
	 * `currency` or language.
	 * @param evt The last change event of the edit, not the blur or keydown event
	 * @param value The amount, or `null` for an empty field
	 */
	onChange?: (
		evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
		value: number | null,
	) => void;
}

const CurrencyInput = (
	props: CurrencyInputProps & Omit<TextFieldProps, "onChange" | "value">,
) => {
	const { value, onChange, onBlur, onKeyDown, currency, ...muiProps } = props;
	const { t } = useCCTranslations();
	const locale = useCurrentLocale();
	const numberFormatOptions: Intl.NumberFormatOptions = useMemo(
		() => ({
			style: "currency",
			currency,
		}),
		[currency],
	);
	const formatNumber = useCallback(
		(value: number | null) =>
			value != null ? value.toLocaleString(locale, numberFormatOptions) : "",
		[locale, numberFormatOptions],
	);
	const valueFormatted = formatNumber(value);
	const [valueInternal, setValueInternal] = useState(valueFormatted);
	// set by a blur whose text does not parse, and shown as the helper text
	const [parseError, setParseError] = useState(false);
	// a new value, currency or language replaces the text, and with it its error
	useEffect(() => {
		setValueInternal(formatNumber(value));
		setParseError(false);
	}, [formatNumber, value]);
	const [lastChangeEvent, setLastChangeEvent] = useState<React.ChangeEvent<
		HTMLTextAreaElement | HTMLInputElement
	> | null>(null);

	// on change handling
	const handleChange = useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			if (!onChange) return;
			setValueInternal(event.target.value);
			event.persist();
			setLastChangeEvent(event);
		},
		[onChange],
	);

	// commits an edit: on the blur after it, and on Enter, as Enter in a form's input submits
	// the form without a blur
	const commit = useCallback(() => {
		if (lastChangeEvent) {
			const value = parseLocalizedNumber(valueInternal, numberFormatOptions);
			if (value != null && isNaN(value)) {
				setParseError(true);
			} else if (onChange) {
				setParseError(false);
				const formatted = formatNumber(value);
				// we parse here so decimal points are limited and view always matches data
				onChange(
					lastChangeEvent,
					parseLocalizedNumber(formatted, numberFormatOptions),
				);
				setLastChangeEvent(null);
			}
		}
	}, [
		formatNumber,
		lastChangeEvent,
		numberFormatOptions,
		onChange,
		valueInternal,
	]);

	const handleBlur = useCallback(
		(evt: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			if (onBlur) onBlur(evt);
			commit();
		},
		[commit, onBlur],
	);

	const handleKeyDown = useCommitOnEnter(commit, onKeyDown);

	// component rendering
	return (
		<TextFieldWithHelp
			{...muiProps}
			value={lastChangeEvent ? valueInternal : valueFormatted}
			onChange={handleChange}
			onBlur={handleBlur}
			onKeyDown={handleKeyDown}
			error={parseError || muiProps.error}
			helperText={
				parseError
					? t("standalone.uikit.number-input.invalid", {
							EXAMPLE: formatNumber(1234.56),
						})
					: muiProps.helperText
			}
			slotProps={{
				...muiProps.slotProps,
				htmlInput: {
					...muiProps.slotProps?.htmlInput,
					inputMode: "decimal",
				},
			}}
			inputMode={"decimal"}
		/>
	);
};

export default React.memo(CurrencyInput);
