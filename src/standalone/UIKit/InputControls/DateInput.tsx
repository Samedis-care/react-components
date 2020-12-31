import React from "react";
import { IconButton, InputAdornment, Tooltip } from "@material-ui/core";
import { DatePicker, DatePickerProps } from "@material-ui/pickers";
import { Info as InfoIcon, Event as CalenderIcon } from "@material-ui/icons";
import {
	InputLabelConfig,
	UIInputProps,
	useInputStyles,
} from "../CommonStyles";

export interface DateInputProps extends UIInputProps {
	infoText?: React.ReactNode;
}

const DateInput = (props: DateInputProps & DatePickerProps) => {
	const { infoText, important, ...muiProps } = props;
	const inputClasses = useInputStyles({ important });

	return (
		<DatePicker
			{...muiProps}
			clearable
			openTo="date"
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

export default React.memo(DateInput);
