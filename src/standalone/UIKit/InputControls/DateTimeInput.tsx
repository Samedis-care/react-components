import React from "react";
import { IconButton, InputAdornment, Tooltip } from "@material-ui/core";
import { DateTimePicker, DateTimePickerProps } from "@material-ui/pickers";
import { Info as InfoIcon, Event as CalenderIcon } from "@material-ui/icons";
import {
	InputLabelConfig,
	UIInputProps,
	useInputStyles,
} from "../CommonStyles";

export interface DateTimeInputProps extends UIInputProps {
	infoText?: React.ReactNode;
}

const DateTimeInput = (props: DateTimeInputProps & DateTimePickerProps) => {
	const { infoText, important, ...muiProps } = props;
	const inputClasses = useInputStyles({ important });

	return (
		<DateTimePicker
			{...muiProps}
			openTo="date"
			clearable
			InputProps={{
				classes: inputClasses,
				endAdornment: (
					<>
						<InputAdornment position="end">
							<IconButton>
								<CalenderIcon color={"disabled"} />
							</IconButton>
						</InputAdornment>
						{infoText && (
							<Tooltip title={infoText}>
								<InfoIcon color={"disabled"} />
							</Tooltip>
						)}
					</>
				),
			}}
			InputLabelProps={InputLabelConfig}
		/>
	);
};

export default React.memo(DateTimeInput);
