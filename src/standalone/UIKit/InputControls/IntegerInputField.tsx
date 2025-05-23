import React, { useCallback } from "react";
import { TextFieldProps } from "@mui/material";
import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../TextFieldWithHelp";
import useInputCursorFix from "../../../utils/useInputCursorFix";
import useCCTranslations from "../../../utils/useCCTranslations";

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
	const { i18n } = useCCTranslations();
	const { value, onChange, noFormat, ...muiProps } = props;
	const valueFormatted =
		value != null
			? noFormat
				? value.toString(10)
				: value.toLocaleString(i18n.language)
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
				inputProps={{
					...muiProps.inputProps,
					ref: cursorInputRef,
					inputMode: "numeric",
				}}
				inputMode={"numeric"}
			/>
		</div>
	);
};

export default React.memo(IntegerInputField);
