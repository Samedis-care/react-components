import React, { useCallback } from "react";
import { TextFieldProps } from "@material-ui/core";
import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../TextFieldWithHelp";
import { useInputCursorFix } from "../../../utils";
import ccI18n from "../../../i18n";
import { useTranslation } from "react-i18next";

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
		value: number | null
	) => void;
}

const IntegerInputField = (
	props: IntegerInputFieldProps & Omit<TextFieldProps, "onChange" | "value">
) => {
	const { i18n } = useTranslation(undefined, { i18n: ccI18n });
	const { value, onChange, ...muiProps } = props;
	const valueFormatted =
		value !== null ? value.toLocaleString(i18n.language) : "";
	const { handleCursorChange, cursorInputRef } = useInputCursorFix(
		valueFormatted
	);

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
		[onChange, handleCursorChange]
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
				}}
			/>
		</div>
	);
};

export default React.memo(IntegerInputField);
