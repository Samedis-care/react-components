import React, { useCallback } from "react";
import { TextFieldProps } from "@mui/material";
import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../TextFieldWithHelp";
import useInputCursorFix from "../../../utils/useInputCursorFix";
import useCurrentLocale from "../../../utils/useCurrentLocale";

export interface IntegerInputFieldProps extends TextFieldWithHelpProps {
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
	/**
	 * disable number formatting
	 */
	noFormat?: boolean;
}

const IntegerInputField = (
	props: IntegerInputFieldProps & Omit<TextFieldProps, "onChange" | "value">,
) => {
	const { value, onChange, noFormat, ...muiProps } = props;
	const locale = useCurrentLocale();
	const valueFormatted =
		value != null
			? noFormat
				? value.toString(10)
				: value.toLocaleString(locale)
			: "";
	const { handleCursorChange, cursorInputRef } =
		useInputCursorFix(valueFormatted);

	// on change handling
	const handleChange = useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			handleCursorChange(event);
			if (!onChange) return;

			const num = event.target.value.replace(/[^0-9]/g, "");
			if (num != "") {
				const numericValue = parseInt(num);
				onChange(event, numericValue);
			} else {
				onChange(event, null);
			}
		},
		[onChange, handleCursorChange],
	);

	// component rendering
	return (
		<div>
			<TextFieldWithHelp
				{...muiProps}
				value={valueFormatted}
				onChange={handleChange}
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
