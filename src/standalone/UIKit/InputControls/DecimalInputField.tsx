import React, { useCallback, useState } from "react";
import { TextFieldProps } from "@material-ui/core";
import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../TextFieldWithHelp";
import {
	delocalizeNumber,
	parseLocalizedNumber,
	useInputCursorFix,
} from "../../../utils";
import useCCTranslations from "../../../utils/useCCTranslations";

export interface DecimalInputFieldProps extends TextFieldWithHelpProps {
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

const DecimalInputField = (
	props: DecimalInputFieldProps & Omit<TextFieldProps, "onChange" | "value">
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
			if (event.target.value === "") handleClear();
			else {
				setValueFormatted(
					parseFloat(delocalizeNumber(event.target.value)).toLocaleString(
						i18n.language
					)
				);
			}
			handleCursorChange(event);
			if (!onChange) return;

			onChange(event, parseLocalizedNumber(event.target.value));
		},
		[handleCursorChange, handleClear, i18n.language, onChange]
	);

	return (
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
	);
};

export default React.memo(DecimalInputField);
