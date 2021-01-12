import React from "react";
import { IconButton, InputAdornment, Tooltip } from "@material-ui/core";
import { DateTimePickerProps } from "@material-ui/pickers";
import { Info as InfoIcon, Event as CalenderIcon } from "@material-ui/icons";
import {
	InputLabelConfig,
	UIInputProps,
	useInputStyles,
} from "../CommonStyles";
import { LocalizedDateTimePicker } from "../../../standalone/LocalizedDateTimePickers";

export interface DateTimeInputProps extends UIInputProps {
	infoText?: React.ReactNode;
}

const DateTimeInput = (props: DateTimeInputProps & DateTimePickerProps) => {
	const { infoText, important, ...muiProps } = props;
	const inputClasses = useInputStyles({ important });

	return (
		<LocalizedDateTimePicker
			{...muiProps}
			clearable
			InputProps={{
				classes: inputClasses,
				endAdornment: (
					<>
						{!muiProps.disabled && (
							<InputAdornment position="end">
								<IconButton>
									<CalenderIcon color={"disabled"} />
								</IconButton>
							</InputAdornment>
						)}
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
