import React, { useCallback, useState } from "react";
import { TextFieldProps } from "@mui/material";
import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../TextFieldWithHelp";
import parseLocalizedNumber from "../../../utils/parseLocalizedNumber";
import useCurrentLocale from "../../../utils/useCurrentLocale";
import useCCTranslations from "../../../utils/useCCTranslations";

export interface DecimalInputFieldProps extends TextFieldWithHelpProps {
	/**
	 * The number, or `null` for an empty field. While the user is not editing
	 * the text, the field shows this value formatted with `format` in the
	 * components-care language, and follows every change of the three. After a
	 * commit it shows the value the parent keeps, which can differ from the
	 * typed text (a clamped or rounded number). A new value also replaces text
	 * the user is typing.
	 */
	value: number | null;
	/**
	 * `Intl.NumberFormatOptions` for the shown text, e.g.
	 * `{ maximumFractionDigits: 2 }`. Read on every render.
	 * @default undefined (at most 3 fraction digits, grouped)
	 */
	format?: Intl.NumberFormatOptions;
	/**
	 * Called on the blur after the user edited the text, with the parsed text.
	 * Typing alone, and a blur without an edit, never call it. Not called when
	 * the text does not parse (a separator without a digit, such as `"."`):
	 * the field keeps the text and the previous value, and shows a message in
	 * place of `helperText` until a valid edit or a new `value`.
	 * @param evt The blur event, although typed as a change event;
	 * `evt.target.name` is the input's `name`
	 * @param value The number; `null` for an empty field or text without a digit
	 */
	onChange?: (
		evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
		value: number | null,
	) => void;
}

const DecimalInputField = (
	props: DecimalInputFieldProps & Omit<TextFieldProps, "onChange" | "value">,
) => {
	const { value, onChange, onBlur, format, ...muiProps } = props;
	const { t } = useCCTranslations();
	const locale = useCurrentLocale();
	// the text typed since the last commit, or null while the field is not edited. Only
	// an edit is committed, so tabbing through the field never stores the shown (rounded)
	// text in place of the value. Without an edit the text is derived from value, locale
	// and format on every render.
	const [draft, setDraft] = useState<string | null>(null);
	// set by a blur whose text does not parse, and shown as the helper text while that
	// text stays
	const [parseError, setParseError] = useState(false);
	// a new value replaces the typed text, and with it its error (Object.is, so a NaN
	// value is no change)
	const [draftValue, setDraftValue] = useState(value);
	if (!Object.is(draftValue, value)) {
		setDraftValue(value);
		setDraft(null);
		setParseError(false);
	}
	const text =
		draft ?? (value !== null ? value.toLocaleString(locale, format) : "");

	const handleBlur = useCallback(
		(event: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			if (onBlur) onBlur(event);
			if (draft === null || !onChange) return;
			const parsed = parseLocalizedNumber(event.target.value);
			if (parsed !== null && Number.isNaN(parsed)) {
				// keeps the text, and with it the previous value, until a valid edit
				setParseError(true);
				return;
			}
			setParseError(false);
			// shows the value the parent keeps from here on, even when it does not change
			setDraft(null);
			onChange(event, parsed);
		},
		[draft, onBlur, onChange],
	);

	// on change handling
	const handleChange = useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			setDraft(event.target.value);
		},
		[],
	);

	return (
		<TextFieldWithHelp
			{...muiProps}
			value={text}
			onChange={handleChange}
			onBlur={handleBlur}
			error={parseError || muiProps.error}
			helperText={
				parseError
					? t("standalone.uikit.number-input.invalid", {
							EXAMPLE: (1234.56).toLocaleString(locale, format),
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

export default React.memo(DecimalInputField);
