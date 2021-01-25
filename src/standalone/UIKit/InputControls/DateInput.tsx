import React, { useCallback } from "react";
import { IconButton, InputAdornment } from "@material-ui/core";
import { DatePickerProps } from "@material-ui/pickers";
import { Info as InfoIcon, Event as CalenderIcon } from "@material-ui/icons";
import {
	InputLabelConfig,
	UIInputProps,
	useInputStyles,
} from "../CommonStyles";
import { LocalizedDatePicker } from "../../../standalone/LocalizedDateTimePickers";

export interface DateInputProps extends UIInputProps {
	openInfo?: () => void;
}

const DateInput = (props: DateInputProps & DatePickerProps) => {
	const { openInfo, important, ...muiProps } = props;
	const inputClasses = useInputStyles({ important });

	const handleOpenInfo = useCallback(
		(event: React.MouseEvent<HTMLButtonElement>) => {
			// Prevent calender popup open event, while clicking on info icon
			event.stopPropagation();
			if (openInfo) openInfo();
		},
		[openInfo]
	);

	return (
		<LocalizedDatePicker
			{...muiProps}
			clearable
			InputProps={{
				classes: inputClasses,
				endAdornment: (
					<InputAdornment position="end">
						{!muiProps.disabled && (
							<IconButton>
								<CalenderIcon color={"disabled"} />
							</IconButton>
						)}
						{openInfo && (
							<IconButton onClick={handleOpenInfo}>
								<InfoIcon color={"disabled"} />
							</IconButton>
						)}
					</InputAdornment>
				),
			}}
			InputLabelProps={InputLabelConfig}
		/>
	);
};

export default React.memo(DateInput);
