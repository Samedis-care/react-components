import React, {
	ForwardedRef,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	TextField,
	TextFieldProps,
	IconButton,
	InputAdornment,
	InputAdornmentProps,
} from "@material-ui/core";
import { Info as InfoIcon, Clear as ClearIcon } from "@material-ui/icons";
import { InputLabelConfig, UIInputProps, useInputStyles } from "./CommonStyles";
import { isTouchDevice } from "../../utils";

export interface TextFieldWithHelpProps extends UIInputProps {
	/**
	 * Optional callback which opens a dialog with information about the field
	 */
	openInfo?: () => void;
}

const TextFieldWithHelp = React.forwardRef(function TextFieldWithHelpInner(
	props: TextFieldWithHelpProps & TextFieldProps,
	ref: ForwardedRef<HTMLDivElement>
) {
	const { openInfo, important, onChange, ...muiProps } = props;
	const inputClasses = useInputStyles({ important });

	// handle clear

	const [hasValue, setHasValue] = useState<boolean>(
		!!(muiProps.value ?? muiProps.defaultValue)
	);

	const inputRef = useRef<HTMLInputElement>(null);

	const handleClear = useCallback(() => {
		if (!inputRef.current) {
			throw new Error("InputRef not set");
		}

		const proto = window.HTMLInputElement.prototype;
		// eslint-disable-next-line @typescript-eslint/unbound-method
		const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
			proto,
			"value"
		)?.set;
		if (!nativeInputValueSetter) {
			throw new Error("Native Input Value Setter is undefined");
		}
		nativeInputValueSetter.call(inputRef.current, "");

		const event = new Event("input", { bubbles: true });
		inputRef.current.dispatchEvent(event);
	}, []);

	// keep "hasValue" up to date

	const handleChange = useCallback(
		(evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			if (onChange) onChange(evt);
			setHasValue(!!evt.target.value);
		},
		[onChange]
	);

	useEffect(() => {
		setHasValue(!!muiProps.value);
	}, [muiProps.value]);

	// render

	return (
		<TextField
			ref={ref}
			InputLabelProps={InputLabelConfig}
			{...muiProps}
			onChange={handleChange}
			InputProps={{
				classes: inputClasses,
				...muiProps.InputProps,
				endAdornment: (
					<>
						<InputAdornment position={"end"}>
							{isTouchDevice() && hasValue && (
								<IconButton onClick={handleClear}>
									<ClearIcon />
								</IconButton>
							)}
							{
								(muiProps.InputProps
									?.endAdornment as React.ReactElement<InputAdornmentProps>)
									?.props?.children
							}
							{openInfo && (
								<IconButton onClick={openInfo}>
									<InfoIcon color={"disabled"} />
								</IconButton>
							)}
						</InputAdornment>
					</>
				),
			}}
			inputProps={{
				...muiProps.inputProps,
				ref: inputRef,
			}}
		/>
	);
});

export default React.memo(TextFieldWithHelp);
