import React, { ForwardedRef, useCallback, useState } from "react";
import {
	TextField,
	TextFieldProps,
	IconButton,
	InputAdornment,
} from "@material-ui/core";
import {
	Info as InfoIcon,
	HighlightOff as ClearIcon,
} from "@material-ui/icons";
import { InputLabelConfig, UIInputProps, useInputStyles } from "./CommonStyles";

export interface TextFieldWithHelpProps extends UIInputProps {
	/**
	 * Optional callback which opens a dialog with information about the field
	 */
	openInfo?: () => void;
	/**
	 * Optional parameter which has formatted value to display on the textfield
	 */
	valueFormatted?: string;
	/**
	 * Optional callback which handles the clear value event
	 */
	onClear?: () => void;
}

const TextFieldWithHelp = React.forwardRef(function TextFieldWithHelpInner(
	props: TextFieldWithHelpProps & TextFieldProps,
	ref: ForwardedRef<HTMLDivElement>
) {
	const {
		openInfo,
		important,
		valueFormatted,
		onClear,
		onChange,
		...muiProps
	} = props;
	const inputClasses = useInputStyles({ important });
	const [value, setValue] = useState(muiProps.value);

	const isTouchDevice = useCallback(() => {
		return (
			"ontouchstart" in window ||
			navigator.maxTouchPoints > 0 ||
			navigator.msMaxTouchPoints > 0
		);
	}, []);

	const handleChange = useCallback(
		(evt: React.ChangeEvent<HTMLInputElement>) => {
			setValue(evt.target.value);
			if (onChange) onChange(evt);
		},
		[onChange]
	);
	const clearValue = useCallback(() => {
		setValue("");
		if (onClear) onClear();
	}, [onClear]);

	return (
		<TextField
			ref={ref}
			InputLabelProps={InputLabelConfig}
			{...muiProps}
			value={valueFormatted ?? value}
			onChange={handleChange}
			InputProps={{
				classes: inputClasses,
				...muiProps.InputProps,
				endAdornment: (
					<>
						{isTouchDevice() && value && (
							<InputAdornment position={"end"}>
								<IconButton onClick={clearValue}>
									<ClearIcon />
								</IconButton>
							</InputAdornment>
						)}
						{muiProps.InputProps?.endAdornment}
						{openInfo && (
							<InputAdornment position={"end"}>
								<IconButton onClick={openInfo}>
									<InfoIcon color={"disabled"} />
								</IconButton>
							</InputAdornment>
						)}
					</>
				),
			}}
		/>
	);
});

export default React.memo(TextFieldWithHelp);
