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
import useCCTranslations from "../../utils/useCCTranslations";
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
	/**
	 * Disable clear button on mobile
	 */
	disableClearable?: boolean;
}

export const UiKitPickersTextFieldWithWarnings = withMuiWarning(
	UiKitPickersTextField,
) as typeof UiKitPickersTextField;
const TextFieldWithHelp = React.forwardRef(
	function PickersTextFieldWithHelpInner(
		props: PickersTextFieldWithHelpProps & PickersTextFieldProps,
		ref: ForwardedRef<HTMLDivElement>,
	) {
		const {
			openInfo,
			customHandleClear,
			disableClearable,
			warning,
			onChange,
			...muiProps
		} = props;
		const { t } = useCCTranslations();

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
		const inputSlotProps = muiProps.slotProps?.input as
			| Record<string, unknown>
			| undefined;
		const existingEndAdornment = inputSlotProps?.endAdornment as
			| React.ReactNode
			| undefined;
		const showClear =
			isTouchDevice() && hasValue && !muiProps.disabled && !disableClearable;
		const hasEndAdornment = !!(showClear || openInfo || existingEndAdornment);

		return (
			<UiKitPickersTextFieldWithWarnings
				ref={ref}
				{...muiProps}
				warning={warning}
				onChange={handleChange}
				slotProps={{
					...muiProps.slotProps,
					input: {
						...inputSlotProps,
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
									{typeof existingEndAdornment === "string"
										? existingEndAdornment
										: (
												existingEndAdornment as React.ReactElement<InputAdornmentProps>
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
					},
					inputLabel: {
						...InputLabelConfig,
						...(muiProps.slotProps?.inputLabel as Record<string, unknown>),
					},
				}}
			/>
		);
	},
);

export default React.memo(TextFieldWithHelp);
