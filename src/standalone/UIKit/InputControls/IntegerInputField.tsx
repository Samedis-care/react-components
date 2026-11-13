import React, { useCallback, useState } from "react";
import { TextFieldProps } from "@mui/material";
import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../TextFieldWithHelp";
import useInputCursorFix from "../../../utils/useInputCursorFix";
import useCurrentLocale from "../../../utils/useCurrentLocale";
import useCCTranslations from "../../../utils/useCCTranslations";
import getNumberSeparator from "../../../utils/getNumberSeparator";
import isNegativeNumberText from "../../../utils/internal/isNegativeNumberText";

export interface IntegerInputFieldProps extends TextFieldWithHelpProps {
	/**
	 * The current value or null if not set. Shown in the components-care
	 * language's number format, never in exponent form: 1e21 is
	 * "1,000,000,000,000,000,000,000" in en, "1000000000000000000000" with
	 * `noFormat`.
	 */
	value: number | null;
	/**
	 * Called on every keystroke with the whole number the text holds: its digits up to the
	 * current locale's decimal separator, without group separators ("1,234.56" is 1234 in en,
	 * "7,5" is 7 in de). A minus sign before the first digit makes it negative ("-56").
	 * Digits typed after the decimal separator, and a minus without a digit yet, stay in the
	 * text until the field loses focus, but are not part of the number.
	 *
	 * Not called while the whole number is outside `Number.MIN_SAFE_INTEGER` to
	 * `Number.MAX_SAFE_INTEGER` (±9,007,199,254,740,991), where a `number` no longer holds
	 * every digit: the parent keeps the value it has, and the field keeps the text as
	 * typed, is marked invalid and shows "Enter a number from -9,007,199,254,740,991 to
	 * 9,007,199,254,740,991" in place of `helperText`, also after it loses focus, until an
	 * edit brings the number back into range or a new `value` arrives.
	 * @param evt The change event; `evt.target.name` is the input's `name`
	 * @param value The number, or `null` for text without a digit
	 */
	onChange?: (
		evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
		value: number | null,
	) => void;
	/**
	 * Shows the value without digit grouping (2026, not 2,026), e.g. for years
	 * or numeric identifiers, and the range in the message for a number out of
	 * range too
	 * @default false
	 */
	noFormat?: boolean;
}

/**
 * Reads the whole number in a text the user typed into an IntegerInputField
 * @param text The text
 * @returns value: the digits up to the locale's decimal separator as a number, negative after a
 *          minus sign, 0 for a fraction without a whole part (".5") and for "-0", null without
 *          any digit; keepText: whether the text says more than the formatted value would (a
 *          decimal separator, or a minus the value can't show yet: "-", "-0"); outOfRange:
 *          whether the number without its sign is beyond Number.MAX_SAFE_INTEGER, where
 *          `value` is rounded to other digits than the text has
 */
const parseInteger = (
	text: string,
): { value: number | null; keepText: boolean; outOfRange: boolean } => {
	const separatorIndex = text.indexOf(getNumberSeparator("decimal"));
	const fraction = separatorIndex !== -1;
	const negative = isNegativeNumberText(text);
	const whole = (fraction ? text.slice(0, separatorIndex) : text).replace(
		/[^0-9]/g,
		"",
	);
	const unsigned =
		whole !== "" ? parseInt(whole) : fraction && /[0-9]/.test(text) ? 0 : null;
	return {
		// no -0: it would be shown as "-0" and stored as 0
		value: negative && unsigned ? -unsigned : unsigned,
		keepText: fraction || (negative && !unsigned),
		outOfRange: unsigned !== null && !Number.isSafeInteger(unsigned),
	};
};

/** `noFormat`: the locale's digits, minus sign and decimal separator, without grouping */
const NO_GROUPING: Intl.NumberFormatOptions = { useGrouping: false };

/** The text and the value the parent held when it was typed */
interface TypedText {
	text: string;
	base: number | null;
}

const IntegerInputField = (
	props: IntegerInputFieldProps & Omit<TextFieldProps, "onChange" | "value">,
) => {
	const { value, onChange, onBlur, noFormat, ...muiProps } = props;
	const { t } = useCCTranslations();
	const locale = useCurrentLocale();
	// toLocaleString, as toString switches to exponent form from 1e21 on
	const format = (num: number) =>
		num.toLocaleString(locale, noFormat ? NO_GROUPING : undefined);
	const valueFormatted = value != null ? format(value) : "";
	// the text the user typed while it says more than the formatted value:
	// - a decimal separator or a minus without digits: shown as typed until the field loses
	//   focus, so digits typed after a decimal separator stay behind it instead of joining the
	//   whole number, and a minus waits for its digits; only while it still reads as the value
	//   (the parent may keep another one)
	// - a number out of range: not reported, so shown with an error until a valid edit or a new
	//   value replaces it, as the text is all that holds its digits
	const [typed, setTyped] = useState<TypedText | null>(null);
	let shownText = valueFormatted;
	let outOfRange = false;
	if (typed !== null) {
		const parsed = parseInteger(typed.text);
		if (!parsed.outOfRange) {
			if (parsed.value === value) shownText = typed.text;
		} else if (Object.is(typed.base, value)) {
			shownText = typed.text;
			outOfRange = true;
		} else {
			// a new value replaces it, also when the parent goes back to the old one later
			setTyped(null);
		}
	}
	const { handleCursorChange, cursorInputRef } = useInputCursorFix(shownText);

	// on change handling
	const handleChange = useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			handleCursorChange(event);
			if (!onChange) return;

			const text = event.target.value;
			const { value: num, keepText, outOfRange } = parseInteger(text);
			setTyped(keepText || outOfRange ? { text, base: value } : null);
			// a number out of range is not reported: the parent keeps the value it has
			if (!outOfRange) onChange(event, num);
		},
		[onChange, handleCursorChange, value],
	);

	const handleBlur = useCallback(
		(event: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			// a number out of range stays, with its message
			if (!outOfRange) setTyped(null);
			if (onBlur) onBlur(event);
		},
		[onBlur, outOfRange],
	);

	// component rendering
	return (
		<div>
			<TextFieldWithHelp
				{...muiProps}
				value={shownText}
				onChange={handleChange}
				onBlur={handleBlur}
				error={outOfRange || muiProps.error}
				helperText={
					outOfRange
						? t("standalone.uikit.number-input.out-of-range", {
								MIN: format(Number.MIN_SAFE_INTEGER),
								MAX: format(Number.MAX_SAFE_INTEGER),
							})
						: muiProps.helperText
				}
				slotProps={{
					...muiProps.slotProps,
					htmlInput: {
						...muiProps.slotProps?.htmlInput,
						ref: cursorInputRef,
						inputMode: "numeric",
					},
				}}
				inputMode={"numeric"}
			/>
		</div>
	);
};

export default React.memo(IntegerInputField);
