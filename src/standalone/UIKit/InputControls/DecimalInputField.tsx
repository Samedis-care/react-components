import React, { useCallback, useEffect, useState } from "react";
import { TextFieldProps } from "@mui/material";
import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../TextFieldWithHelp";
import parseLocalizedNumber from "../../../utils/parseLocalizedNumber";
import useCCTranslations from "../../../utils/useCCTranslations";

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
	 * The change event handler
	 * @param evt
	 * @param value
	 */
	onChange?: (
		evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
		value: number | null,
	) => void;
}

const DecimalInputField = (
	props: DecimalInputFieldProps & Omit<TextFieldProps, "onChange" | "value">,
) => {
	const { i18n } = useCCTranslations();
	const { value, onChange, format, ...muiProps } = props;
	const [valueInternal, setValueInternal] = useState("");
	useEffect(() => {
		setValueInternal(
			value !== null ? value.toLocaleString(i18n.language, format) : "",
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value]);

	const handleBlur = useCallback(
		(event: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			if (!onChange) return;
			onChange(event, parseLocalizedNumber(event.target.value));
		},
		[onChange],
	);

	// on change handling
	const handleChange = useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
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
			inputProps={{
				...muiProps.inputProps,
				inputMode: "numeric",
			}}
			inputMode={"numeric"}
		/>
	);
};

export default React.memo(DecimalInputField);
