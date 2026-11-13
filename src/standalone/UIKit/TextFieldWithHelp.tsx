import React, { ForwardedRef, useCallback, useRef, useState } from "react";
import {
	IconButton,
	InputAdornment,
	InputAdornmentProps,
	InputBaseComponentProps,
	InputLabelProps,
	InputProps,
	TextFieldProps,
} from "@mui/material";
import { Clear as ClearIcon, Info as InfoIcon } from "@mui/icons-material";
import { InputLabelConfig, UIInputProps, UiKitTextField } from "./CommonStyles";
import isTouchDevice from "../../utils/isTouchDevice";
import { withMuiFieldState } from "./MuiFieldState";
import useCCTranslations from "../../utils/useCCTranslations";
import { useRefComposer } from "react-ref-composer";
import accessSlotProps from "../../utils/internal/accessSlotProps";

export interface TextFieldWithHelpProps extends UIInputProps {
	/**
	 * Optional callback which opens a dialog with information about the field
	 */
	openInfo?: () => void;
	/**
	 * Replaces what the touch Clear button does: called without arguments
	 * when it is pressed. Without it, the button empties the text input, so
	 * `onChange` receives an event whose `target.value` is `""`.
	 *
	 * A `select` has no such default: it shows the Clear button only when
	 * this is set.
	 */
	customHandleClear?: () => void;
	/**
	 * Hides the Clear button. That button is only rendered on touch devices,
	 * while the field shows a value (`0` included) and its input can be
	 * edited: not while the field is `disabled`, nor while `slotProps.input`
	 * or `slotProps.htmlInput` sets `readOnly` or `disabled`. In a `select`
	 * only with `customHandleClear`.
	 * @default false
	 */
	disableClearable?: boolean;
}

export const UiKitTextFieldWithState = withMuiFieldState(
	UiKitTextField,
) as typeof UiKitTextField;
const TextFieldWithHelp = React.forwardRef(function TextFieldWithHelpInner(
	props: TextFieldWithHelpProps & TextFieldProps,
	ref: ForwardedRef<HTMLDivElement>,
) {
	const {
		openInfo,
		customHandleClear,
		disableClearable,
		warning,
		dirty,
		onChange,
		...muiProps
	} = props;
	const { t } = useCCTranslations();

	// handle clear

	// what an uncontrolled field shows: its defaultValue, then what was typed
	const [uncontrolledValue, setUncontrolledValue] = useState<unknown>(
		muiProps.defaultValue,
	);

	const composeRef = useRefComposer<HTMLTextAreaElement | HTMLInputElement>();
	const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

	const handleClear = useCallback(
		(evt: React.MouseEvent) => {
			evt.stopPropagation();
			if (customHandleClear) {
				return customHandleClear();
			}
			if (!inputRef.current) {
				throw new Error("InputRef not set");
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
			inputRef.current.blur();
			inputRef.current.focus();
		},
		[muiProps.multiline, customHandleClear],
	);

	// keep "uncontrolledValue" up to date

	const handleChange = useCallback(
		(evt: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			if (onChange) onChange(evt);
			setUncontrolledValue(evt.target.value);
		},
		[onChange],
	);

	// render
	const canClear =
		isTouchDevice() &&
		!muiProps.disabled &&
		!disableClearable &&
		// the default clear empties the <input> or <textarea>; a select has
		// neither (its htmlInput ref holds MUI's handle), so it needs a handler
		(!muiProps.select || !!customHandleClear);

	return (
		<UiKitTextFieldWithState
			ref={ref}
			{...muiProps}
			warning={warning}
			dirty={dirty}
			onChange={handleChange}
			slotProps={{
				input: (props) => {
					const orgSlotProps: InputProps = {
						...accessSlotProps(props, muiProps.slotProps?.input),
					};
					// what the field shows: the controlled value, which MUI takes
					// from slotProps.htmlInput before value, or the uncontrolled one
					const htmlInputProps = accessSlotProps(
						props,
						muiProps.slotProps?.htmlInput,
					) as InputBaseComponentProps | undefined;
					const value: unknown =
						htmlInputProps?.value ?? muiProps.value ?? uncontrolledValue;
					// the input slots can lock the input while the field is not disabled
					const inputLocked = !!(
						orgSlotProps.readOnly ||
						orgSlotProps.disabled ||
						htmlInputProps?.readOnly ||
						htmlInputProps?.disabled
					);
					const showClear =
						canClear &&
						!inputLocked &&
						value != null &&
						value !== "" &&
						!(Array.isArray(value) && value.length === 0);
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
										<IconButton
											onClick={handleClear}
											size="small"
											aria-label={t("standalone.uikit.clear")}
										>
											<ClearIcon />
										</IconButton>
									)}
									{typeof orgSlotProps?.endAdornment === "string"
										? orgSlotProps.endAdornment
										: (
												orgSlotProps?.endAdornment as React.ReactElement<InputAdornmentProps>
											)?.props?.children}
									{openInfo && (
										<IconButton
											onClick={openInfo}
											size="small"
											aria-label={t("standalone.uikit.info")}
										>
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
						...accessSlotProps(props, muiProps.slotProps?.inputLabel),
					}) as InputLabelProps,
			}}
		/>
	);
});

export default React.memo(TextFieldWithHelp);
