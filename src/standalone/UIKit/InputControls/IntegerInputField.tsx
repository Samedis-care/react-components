import React, { useCallback, useState } from "react";
import { TextFieldProps } from "@mui/material";
import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../TextFieldWithHelp";
import useInputCursorFix from "../../../utils/useInputCursorFix";
import useCurrentLocale from "../../../utils/useCurrentLocale";
import getNumberSeparator from "../../../utils/getNumberSeparator";
import isNegativeNumberText from "../../../utils/internal/isNegativeNumberText";

export interface IntegerInputFieldProps extends TextFieldWithHelpProps {
	/**
	 * The current value or null if not set
	 */
	value: number | null;
	/**
	 * Called on every keystroke with the whole number the text holds: its digits up to the
	 * current locale's decimal separator, without group separators ("1,234.56" is 1234 in en,
	 * "7,5" is 7 in de). A minus sign before the first digit makes it negative ("-56").
	 * Digits typed after the decimal separator, and a minus without a digit yet, stay in the
	 * text until the field loses focus, but are not part of the number.
	 * @param evt The change event; `evt.target.name` is the input's `name`
	 * @param value The number, or `null` for text without a digit
	 */
	onChange?: (
		evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
		value: number | null,
	) => void;
	/**
	 * disable number formatting
	 */
	noFormat?: boolean;
}

/**
 * Reads the whole number in a text the user typed into an IntegerInputField
 * @param text The text
 * @returns value: the digits up to the locale's decimal separator as a number, negative after a
 *          minus sign, 0 for a fraction without a whole part (".5") and for "-0", null without
 *          any digit; keepText: whether the text says more than the formatted value would (a
 *          decimal separator, or a minus the value can't show yet: "-", "-0")
 */
const parseInteger = (
	text: string,
): { value: number | null; keepText: boolean } => {
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
	};
};

const IntegerInputField = (
	props: IntegerInputFieldProps & Omit<TextFieldProps, "onChange" | "value">,
) => {
	const { value, onChange, onBlur, noFormat, ...muiProps } = props;
	const locale = useCurrentLocale();
	const valueFormatted =
		value != null
			? noFormat
				? value.toString(10)
				: value.toLocaleString(locale)
			: "";
	// the text the user typed while it says more than the formatted value: shown as typed until
	// the field loses focus, so digits typed after a decimal separator stay behind it instead of
	// joining the whole number, and a minus waits for its digits; only while it still reads as
	// the value (the parent may keep another one)
	const [typedText, setTypedText] = useState<string | null>(null);
	const shownText =
		typedText !== null && parseInteger(typedText).value === value
			? typedText
			: valueFormatted;
	const { handleCursorChange, cursorInputRef } = useInputCursorFix(shownText);

	// on change handling
	const handleChange = useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			handleCursorChange(event);
			if (!onChange) return;

			const { value: num, keepText } = parseInteger(event.target.value);
			setTypedText(keepText ? event.target.value : null);
			onChange(event, num);
		},
		[onChange, handleCursorChange],
	);

	const handleBlur = useCallback(
		(event: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			setTypedText(null);
			if (onBlur) onBlur(event);
		},
		[onBlur],
	);

	// component rendering
	return (
		<div>
			<TextFieldWithHelp
				{...muiProps}
				value={shownText}
				onChange={handleChange}
				onBlur={handleBlur}
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
