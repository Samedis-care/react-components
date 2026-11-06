import React, { useCallback, useState } from "react";
import { TextFieldProps } from "@mui/material";
import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../TextFieldWithHelp";
import useInputCursorFix from "../../../utils/useInputCursorFix";
import useCurrentLocale from "../../../utils/useCurrentLocale";
import getNumberSeparator from "../../../utils/getNumberSeparator";

export interface IntegerInputFieldProps extends TextFieldWithHelpProps {
	/**
	 * The current value or null if not set
	 */
	value: number | null;
	/**
	 * Called on every keystroke with the whole number the text holds: its digits up to the
	 * current locale's decimal separator, without group separators ("1,234.56" is 1234 in en,
	 * "7,5" is 7 in de). Digits typed after the decimal separator stay in the text until the
	 * field loses focus, but are not part of the number.
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
 * @returns value: the digits up to the locale's decimal separator as a number, 0 for a
 *          fraction without a whole part (".5"), null without any digit; fraction: whether the
 *          text has a decimal separator
 */
const parseInteger = (
	text: string,
): { value: number | null; fraction: boolean } => {
	const separatorIndex = text.indexOf(getNumberSeparator("decimal"));
	const fraction = separatorIndex !== -1;
	const whole = (fraction ? text.slice(0, separatorIndex) : text).replace(
		/[^0-9]/g,
		"",
	);
	if (whole !== "") return { value: parseInt(whole), fraction };
	return { value: fraction && /[0-9]/.test(text) ? 0 : null, fraction };
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
	// the text the user typed while it has a decimal separator: shown as typed until the field
	// loses focus, so digits typed after the separator stay behind it instead of joining the
	// whole number; only while it still reads as the value (the parent may keep another one)
	const [fractionText, setFractionText] = useState<string | null>(null);
	const shownText =
		fractionText !== null && parseInteger(fractionText).value === value
			? fractionText
			: valueFormatted;
	const { handleCursorChange, cursorInputRef } = useInputCursorFix(shownText);

	// on change handling
	const handleChange = useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			handleCursorChange(event);
			if (!onChange) return;

			const { value: num, fraction } = parseInteger(event.target.value);
			setFractionText(fraction ? event.target.value : null);
			onChange(event, num);
		},
		[onChange, handleCursorChange],
	);

	const handleBlur = useCallback(
		(event: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			setFractionText(null);
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
