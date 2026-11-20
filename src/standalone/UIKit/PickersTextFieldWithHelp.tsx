import React, { ForwardedRef, useCallback, useRef, useState } from "react";
import { IconButton, InputAdornment, InputAdornmentProps } from "@mui/material";
import { Clear as ClearIcon, Info as InfoIcon } from "@mui/icons-material";
import {
	InputLabelConfig,
	UIInputProps,
	UiKitPickersTextField,
} from "./CommonStyles";
import isTouchDevice from "../../utils/isTouchDevice";
import accessSlotProps from "../../utils/internal/accessSlotProps";
import { withMuiFieldState } from "./MuiFieldState";
import useCCTranslations from "../../utils/useCCTranslations";
import {
	PickersSectionListRef,
	PickersTextFieldProps,
} from "@mui/x-date-pickers";
import { useRefComposer } from "react-ref-composer";

export interface PickersTextFieldWithHelpProps extends UIInputProps {
	/**
	 * Optional callback which opens a dialog with information about the field
	 */
	openInfo?: () => void;
	/**
	 * Clears the picker's value, e.g. `() => onChange(null)`: called without
	 * arguments when the touch Clear button is pressed. Focus then moves to the
	 * date's first section, as after the clear button of MUI X's own fields,
	 * since the Clear button goes away with the value.
	 */
	customHandleClear: () => void;
	/**
	 * Hides the Clear button. That button is only rendered on touch devices,
	 * while the field has a value and is neither disabled nor read-only (the
	 * picker's `readOnly`, which reaches the field as `slotProps.input.readOnly`).
	 * @default false
	 */
	disableClearable?: boolean;
}

export const UiKitPickersTextFieldWithState = withMuiFieldState(
	UiKitPickersTextField,
) as typeof UiKitPickersTextField;
const TextFieldWithHelp: React.ForwardRefExoticComponent<
	PickersTextFieldWithHelpProps &
		PickersTextFieldProps &
		React.RefAttributes<HTMLDivElement>
> = React.forwardRef(function PickersTextFieldWithHelpInner(
	props: PickersTextFieldWithHelpProps & PickersTextFieldProps,
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

	const [hasInputValue, setHasInputValue] = useState<boolean>(
		!!muiProps.defaultValue,
	);
	const hasValue = muiProps.value == null ? hasInputValue : !!muiProps.value;

	const composeSectionListRef = useRefComposer<PickersSectionListRef>();
	const sectionListRef = useRef<PickersSectionListRef>(null);

	const handleClear = useCallback(
		(evt: React.MouseEvent) => {
			evt.stopPropagation();
			if (!customHandleClear) return;
			customHandleClear();
			// the Clear button unmounts with the value: keep focus in the field
			sectionListRef.current?.getSectionContent(0)?.focus();
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
	const inputSlotProps = muiProps.slotProps?.input;
	const existingEndAdornment = inputSlotProps?.endAdornment;
	// a read-only picker passes its readOnly as slotProps.input.readOnly
	const showClear =
		isTouchDevice() &&
		hasValue &&
		!muiProps.disabled &&
		!inputSlotProps?.readOnly &&
		!disableClearable;
	const hasEndAdornment = !!(showClear || openInfo || existingEndAdornment);

	return (
		<UiKitPickersTextFieldWithState
			ref={ref}
			{...muiProps}
			warning={warning}
			dirty={dirty}
			onChange={handleChange}
			sectionListRef={composeSectionListRef(
				sectionListRef,
				muiProps.sectionListRef,
			)}
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
				// an object, resolved from a function form (as MUI's TextField takes it):
				// PickersTextField spreads it and reads its shrink for the outline's notch
				inputLabel: {
					...InputLabelConfig,
					...accessSlotProps(props, muiProps.slotProps?.inputLabel),
				},
			}}
		/>
	);
});

export default React.memo(TextFieldWithHelp) as typeof TextFieldWithHelp;
