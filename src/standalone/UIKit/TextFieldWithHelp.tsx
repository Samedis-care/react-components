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
	InputLabelProps,
	InputProps,
	TextFieldProps,
} from "@mui/material";
import { Clear as ClearIcon, Info as InfoIcon } from "@mui/icons-material";
import { InputLabelConfig, UIInputProps, UiKitTextField } from "./CommonStyles";
import isTouchDevice from "../../utils/isTouchDevice";
import { withMuiWarning } from "./MuiWarning";
import { useRefComposer } from "react-ref-composer";
import accessSlotProps from "../../utils/internal/accessSlotProps";

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

export const UiKitTextFieldWithWarnings = withMuiWarning(
	UiKitTextField,
) as typeof UiKitTextField;
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

	return (
		<UiKitTextFieldWithWarnings
			ref={ref}
			{...muiProps}
			warning={warning}
			onChange={handleChange}
			slotProps={{
				input: (props) => {
					const orgSlotProps: InputProps = {
						...accessSlotProps(props, muiProps.slotProps?.input),
						...muiProps.InputProps,
					};
					const hasEndAdornment = !!(
						showClear ||
						openInfo ||
						orgSlotProps?.endAdornment
					);
					return {
						...orgSlotProps,
						endAdornment: hasEndAdornment ? (
							<>
								<InputAdornment position={"end"}>
									{showClear && (
										<IconButton onClick={handleClear} size="small">
											<ClearIcon />
										</IconButton>
									)}
									{typeof orgSlotProps?.endAdornment === "string"
										? orgSlotProps.endAdornment
										: (
												orgSlotProps?.endAdornment as React.ReactElement<InputAdornmentProps>
											)?.props?.children}
									{openInfo && (
										<IconButton onClick={openInfo} size="small">
											<InfoIcon color={"disabled"} />
										</IconButton>
									)}
								</InputAdornment>
							</>
						) : undefined,
					};
				},
				htmlInput: (props) => ({
					...accessSlotProps(props, muiProps.slotProps?.htmlInput),
					ref: composeRef(
						inputRef,
						accessSlotProps(props, muiProps.slotProps?.htmlInput)
							?.ref as typeof inputRef,
					),
				}),
				inputLabel: (props) =>
					({
						...InputLabelConfig,
						...muiProps.InputLabelProps,
						...accessSlotProps(props, muiProps.slotProps?.inputLabel),
					}) as InputLabelProps,
			}}
		/>
	);
});

export default React.memo(TextFieldWithHelp);
