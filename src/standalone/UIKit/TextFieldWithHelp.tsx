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
import isTouchDevice from "../../utils/isTouchDevice";
import { withMuiWarning } from "./MuiWarning";
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

export const UiKitTextFieldWithWarnings = withMuiWarning(UiKitTextField);

const TextFieldWithHelp = React.forwardRef(function TextFieldWithHelpInner(
	props: TextFieldWithHelpProps & TextFieldProps,
	ref: ForwardedRef<HTMLDivElement>,
) {
	const { openInfo, customHandleClear, warning, onChange, ...muiProps } = props;

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
	const showClear = isTouchDevice() && hasValue && !muiProps.disabled;
	const hasEndAdornment = !!(
		showClear ||
		openInfo ||
		muiProps.InputProps?.endAdornment
	);

	return (
		<UiKitTextFieldWithWarnings
			ref={ref}
			InputLabelProps={InputLabelConfig}
			{...muiProps}
			warning={warning}
			onChange={handleChange}
			InputProps={{
				...muiProps.InputProps,
				endAdornment: hasEndAdornment ? (
					<>
						<InputAdornment position={"end"}>
							{showClear && (
								<IconButton onClick={handleClear} size="small">
									<ClearIcon />
								</IconButton>
							)}
							{typeof muiProps.InputProps?.endAdornment === "string"
								? muiProps.InputProps.endAdornment
								: (
										muiProps.InputProps
											?.endAdornment as React.ReactElement<InputAdornmentProps>
									)?.props?.children}
							{openInfo && (
								<IconButton onClick={openInfo} size="small">
									<InfoIcon color={"disabled"} />
								</IconButton>
							)}
						</InputAdornment>
					</>
				) : undefined,
			}}
			inputProps={{
				...muiProps.inputProps,
				ref: composeRef(inputRef, muiProps.inputProps?.ref as typeof inputRef),
			}}
		/>
	);
});

export default React.memo(TextFieldWithHelp);
