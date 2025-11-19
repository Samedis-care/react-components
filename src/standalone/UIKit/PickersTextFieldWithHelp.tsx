import React, { ForwardedRef, useCallback, useState } from "react";
import { IconButton, InputAdornment, InputAdornmentProps } from "@mui/material";
import { Clear as ClearIcon, Info as InfoIcon } from "@mui/icons-material";
import {
	InputLabelConfig,
	UIInputProps,
	UiKitPickersTextField,
} from "./CommonStyles";
import isTouchDevice from "../../utils/isTouchDevice";
import { withMuiWarning } from "./MuiWarning";
import { PickersTextFieldProps } from "@mui/x-date-pickers";

export interface PickersTextFieldWithHelpProps extends UIInputProps {
	/**
	 * Optional callback which opens a dialog with information about the field
	 */
	openInfo?: () => void;
	/**
	 * custom clear handler if clear button is pressed
	 */
	customHandleClear: () => void;
}

export const UiKitPickersTextFieldWithWarnings = withMuiWarning(
	UiKitPickersTextField,
) as typeof UiKitPickersTextField;
const TextFieldWithHelp = React.forwardRef(
	function PickersTextFieldWithHelpInner(
		props: PickersTextFieldWithHelpProps & PickersTextFieldProps,
		ref: ForwardedRef<HTMLDivElement>,
	) {
		const { openInfo, customHandleClear, warning, onChange, ...muiProps } =
			props;

		// handle clear

		const [hasInputValue, setHasInputValue] = useState<boolean>(
			!!muiProps.defaultValue,
		);
		const hasValue = muiProps.value == null ? hasInputValue : !!muiProps.value;

		const handleClear = useCallback(
			(evt: React.MouseEvent) => {
				evt.stopPropagation();
				if (customHandleClear) {
					return customHandleClear();
				}
			},
			[customHandleClear],
		);

		// keep "hasValue" up to date

		const handleChange = useCallback(
			(evt: React.ChangeEvent<HTMLInputElement>) => {
				if (onChange) onChange(evt);
				setHasInputValue(!!evt.target.value);
			},
			[onChange],
		);

		// render
		const showClear = isTouchDevice() && hasValue && !muiProps.disabled;
		const hasEndAdornment = !!(
			showClear ||
			openInfo ||
			muiProps.InputProps?.endAdornment
		);

		return (
			<UiKitPickersTextFieldWithWarnings
				ref={ref}
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
									? muiProps.InputProps?.endAdornment
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
				InputLabelProps={{
					...InputLabelConfig,
					...muiProps.InputLabelProps,
				}}
			/>
		);
	},
);

export default React.memo(TextFieldWithHelp);
