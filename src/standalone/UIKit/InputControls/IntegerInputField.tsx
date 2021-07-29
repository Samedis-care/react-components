import React, { useCallback, useState } from "react";
import { TextFieldProps } from "@material-ui/core";
import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../TextFieldWithHelp";
import { useInputCursorFix } from "../../../utils";
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
		value: number | null
	) => void;
}

const IntegerInputField = (
	props: IntegerInputFieldProps & Omit<TextFieldProps, "onChange" | "value">
) => {
	const { i18n } = useCCTranslations();
	const { value, onChange, ...muiProps } = props;
	const [valueFormatted, setValueFormatted] = useState<string>(
		value !== null ? value.toLocaleString(i18n.language) : ""
	);
	const { handleCursorChange, cursorInputRef } = useInputCursorFix(
		valueFormatted
	);

	const handleClear = useCallback(() => {
		setValueFormatted("");
	}, []);

	// on change handling
	const handleChange = useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			const num = event.target.value.replace(/[^0-9]/g, "");
			if (num === "") handleClear();
			else {
				setValueFormatted(parseInt(num).toLocaleString(i18n.language));
			}
			handleCursorChange(event);
			if (!onChange) return;

			if (num != "") {
				const numericValue = parseInt(num);
				onChange(event, numericValue);
			} else {
				onChange(event, null);
			}
		},
		[handleClear, handleCursorChange, onChange, i18n.language]
	);

	// component rendering
	return (
		<div>
			<TextFieldWithHelp
				{...muiProps}
				valueFormatted={valueFormatted}
				onChange={handleChange}
				onClear={handleClear}
				inputProps={{
					...muiProps.inputProps,
					ref: cursorInputRef,
				}}
			/>
		</div>
	);
};

export default React.memo(IntegerInputField);
