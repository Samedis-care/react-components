import React from "react";
import { IconButton, InputAdornment, Tooltip } from "@material-ui/core";
import { DatePickerProps } from "@material-ui/pickers";
import { Info as InfoIcon, Event as CalenderIcon } from "@material-ui/icons";
import {
	InputLabelConfig,
	UIInputProps,
	useInputStyles,
} from "../CommonStyles";
import { LocalizedDatePicker } from "../../../standalone/LocalizedDateTimePickers";

export interface DateInputProps extends UIInputProps {
	infoText?: React.ReactNode;
}

const DateInput = (props: DateInputProps & DatePickerProps) => {
	const { infoText, important, ...muiProps } = props;
	const inputClasses = useInputStyles({ important });

	return (
		<LocalizedDatePicker
			{...muiProps}
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

export default React.memo(DateInput);
