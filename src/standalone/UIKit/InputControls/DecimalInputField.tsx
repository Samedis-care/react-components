import React, { useCallback, useEffect, useRef, useState } from "react";
import { TextFieldProps } from "@mui/material";
import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../TextFieldWithHelp";
import parseLocalizedNumber from "../../../utils/parseLocalizedNumber";
import useCurrentLocale from "../../../utils/useCurrentLocale";

export interface DecimalInputFieldProps extends TextFieldWithHelpProps {
	/**
	 * The current value or null if not set
	 */
	value: number | null;
	/**
	 * number formatting options
	 */
	format?: Intl.NumberFormatOptions;
	/**
	 * Called on the blur after the user edited the text, with the parsed text.
	 * Typing alone, and a blur without an edit, never call it.
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
	const locale = useCurrentLocale();
	const [valueInternal, setValueInternal] = useState("");
	useEffect(() => {
		setValueInternal(
			value !== null ? value.toLocaleString(locale, format) : "",
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value]);

	// whether the text was edited since the last commit: only then does a blur commit, so
	// tabbing through the field never stores the shown (rounded) text in place of the value
	const editedRef = useRef(false);

	const handleBlur = useCallback(
		(event: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			if (onBlur) onBlur(event);
			if (!editedRef.current || !onChange) return;
			editedRef.current = false;
			onChange(event, parseLocalizedNumber(event.target.value));
		},
		[onBlur, onChange],
	);

	// on change handling
	const handleChange = useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			editedRef.current = true;
			setValueInternal(event.target.value);
		},
		[],
	);

	return (
		<TextFieldWithHelp
			{...muiProps}
			value={valueInternal}
			onChange={handleChange}
			onBlur={handleBlur}
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
