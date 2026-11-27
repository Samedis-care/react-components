import React, { useCallback, useEffect, useMemo, useState } from "react";
import { TextFieldProps } from "@mui/material";
import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../TextFieldWithHelp";
import parseLocalizedNumber from "../../../utils/parseLocalizedNumber";
import useCurrentLocale from "../../../utils/useCurrentLocale";
import useCCTranslations from "../../../utils/useCCTranslations";
import useCommitOnEnter from "../../../utils/internal/useCommitOnEnter";
import addSlotAttributes from "../../../utils/internal/addSlotAttributes";
import formatLocalizedNumber, {
	type CurrencyFallback,
	getCurrencyFallback,
	isWellFormedCurrency,
	removeCurrencyText,
} from "../../../utils/internal/formatLocalizedNumber";
import useCurrencyErrorReport from "../useCurrencyErrorReport";

export interface CurrencyInputProps extends TextFieldWithHelpProps {
	/**
	 * The currency of the amount, an ISO 4217 code (`"EUR"`, `"JPY"`). It sets
	 * how the amount is shown and the decimals it is rounded to on commit: 2 for
	 * EUR, 0 for JPY. A well-formed code `Intl` doesn't know (`"XYZ"`) is shown
	 * as the code, with two decimals.
	 *
	 * A currency that `Intl` rejects does not throw, and is reported (see
	 * `disableErrorReporting`):
	 * - a text that is not three letters (`"EURO"`, `"€"`) is shown as if it
	 *   were a code, where the language puts one ("EURO 1,234.50" in en,
	 *   "1.234,50 EURO" in de);
	 * - a missing one (`""`, or `undefined` or `null` from untyped data) leaves
	 *   the currency out: the plain amount ("1,234.50").
	 *
	 * Both round to two decimals, and the field reads back the text it shows.
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
	/**
	 * Don't report a currency that `Intl` rejects (see `currency`), for an
	 * amount whose currency may be missing on purpose.
	 *
	 * By default (`false`) each CurrencyInput reports it once while it shows an
	 * amount, not again on a re-render with the same currency: to the error
	 * reporter (source "CurrencyInput", extra `{ style: "currency", currency }`;
	 * Sentry unless the app calls `configureErrorReporting`) and through
	 * `console.error`. With `true` it does neither; the field is the same.
	 */
	disableErrorReporting?: boolean;
}

const CurrencyInput = (
	props: CurrencyInputProps & Omit<TextFieldProps, "onChange" | "value">,
) => {
	const {
		value,
		onChange,
		onBlur,
		onKeyDown,
		currency,
		disableErrorReporting,
		...muiProps
	} = props;
	const { t } = useCCTranslations();
	const locale = useCurrentLocale();
	const numberFormatOptions: Intl.NumberFormatOptions = useMemo(
		() => ({
			style: "currency",
			currency,
		}),
		[currency],
	);
	// what the text is read back with: the options it is formatted with, or, for
	// a currency Intl rejects, the ones it is formatted with in their place
	const readFormat: CurrencyFallback = useMemo(
		() =>
			isWellFormedCurrency(currency)
				? { options: numberFormatOptions, currencyText: null }
				: getCurrencyFallback(numberFormatOptions),
		[currency, numberFormatOptions],
	);
	const formatNumber = useCallback(
		(value: number | null) =>
			value != null
				? formatLocalizedNumber(value, locale, numberFormatOptions).text
				: "",
		[locale, numberFormatOptions],
	);
	const parseNumber = useCallback(
		(text: string) =>
			parseLocalizedNumber(
				removeCurrencyText(text, locale, readFormat),
				readFormat.options,
			),
		[locale, readFormat],
	);
	const formatted = useMemo(
		() =>
			value != null
				? formatLocalizedNumber(value, locale, numberFormatOptions)
				: null,
		[locale, numberFormatOptions, value],
	);
	const valueFormatted = formatted ? formatted.text : "";
	useCurrencyErrorReport(
		"CurrencyInput",
		formatted?.currencyError ?? null,
		disableErrorReporting,
		"currency",
		currency,
	);
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
			const value = parseNumber(valueInternal);
			if (value != null && isNaN(value)) {
				setParseError(true);
			} else if (onChange) {
				setParseError(false);
				// we parse here so decimal points are limited and view always matches data
				onChange(lastChangeEvent, parseNumber(formatNumber(value)));
				setLastChangeEvent(null);
			}
		}
	}, [formatNumber, lastChangeEvent, onChange, parseNumber, valueInternal]);

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
			slotProps={addSlotAttributes(muiProps.slotProps, "htmlInput", {
				inputMode: "decimal",
			})}
			inputMode={"decimal"}
		/>
	);
};

export default React.memo(CurrencyInput);
