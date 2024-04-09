import React, {
	ForwardedRef,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	IconButton,
	InputAdornment,
	InputAdornmentProps,
	TextFieldProps,
} from "@mui/material";
import { Clear as ClearIcon, Info as InfoIcon } from "@mui/icons-material";
import { InputLabelConfig, UIInputProps, UiKitTextField } from "./CommonStyles";
import combineClassNames from "../../utils/combineClassNames";
import isTouchDevice from "../../utils/isTouchDevice";
import { useMuiWarningStyles } from "./MuiWarning";
import { useRefComposer } from "react-ref-composer";

export interface TextFieldWithHelpProps extends UIInputProps {
	/**
	 * Optional callback which opens a dialog with information about the field
	 */
	openInfo?: () => void;
	/**
	 * custom clear handler if clear button is pressed
	 */
	customHandleClear?: () => void;
}

const TextFieldWithHelp = React.forwardRef(function TextFieldWithHelpInner(
	props: TextFieldWithHelpProps & TextFieldProps,
	ref: ForwardedRef<HTMLDivElement>,
) {
	const { openInfo, customHandleClear, warning, onChange, ...muiProps } = props;
	const warningClasses = useMuiWarningStyles();

	// handle clear

	const [hasValue, setHasValue] = useState<boolean>(
		!!(muiProps.value ?? muiProps.defaultValue),
	);

	const composeRef = useRefComposer<HTMLTextAreaElement | HTMLInputElement>();
	const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

	const handleClear = useCallback(
		(evt: React.MouseEvent) => {
			if (!inputRef.current) {
				throw new Error("InputRef not set");
			}
			evt.stopPropagation();
			if (customHandleClear) {
				return customHandleClear();
			}

			const proto = (
				muiProps.multiline ? HTMLTextAreaElement : HTMLInputElement
			).prototype;
			// eslint-disable-next-line @typescript-eslint/unbound-method
			const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
				proto,
				"value",
			)?.set;
			if (!nativeInputValueSetter) {
				throw new Error("Native Input Value Setter is undefined");
			}
			nativeInputValueSetter.call(inputRef.current, "");

			const event = new Event("input", { bubbles: true });
			inputRef.current.dispatchEvent(event);
		},
		[muiProps.multiline, customHandleClear],
	);

	// keep "hasValue" up to date

	const handleChange = useCallback(
		(evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			if (onChange) onChange(evt);
			setHasValue(!!evt.target.value);
		},
		[onChange],
	);

	useEffect(() => {
		setHasValue(!!muiProps.value);
	}, [muiProps.value]);

	// render

	return (
		<UiKitTextField
			ref={ref}
			InputLabelProps={InputLabelConfig}
			{...muiProps}
			className={combineClassNames([
				warning && warningClasses.warning,
				muiProps.className,
			])}
			onChange={handleChange}
			InputProps={{
				...muiProps.InputProps,
				endAdornment: (
					<>
						<InputAdornment position={"end"}>
							{isTouchDevice() && hasValue && !muiProps.disabled && (
								<IconButton onClick={handleClear} size="large">
									<ClearIcon />
								</IconButton>
							)}
							{
								(
									muiProps.InputProps
										?.endAdornment as React.ReactElement<InputAdornmentProps>
								)?.props?.children
							}
							{openInfo && (
								<IconButton onClick={openInfo} size="large">
									<InfoIcon color={"disabled"} />
								</IconButton>
							)}
						</InputAdornment>
					</>
				),
			}}
			inputProps={{
				...muiProps.inputProps,
				ref: composeRef(inputRef, muiProps.inputProps?.ref as typeof inputRef),
			}}
		/>
	);
});

export default React.memo(TextFieldWithHelp);
