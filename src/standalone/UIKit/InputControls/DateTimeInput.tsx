import React from "react";
import { IconButton, InputAdornment } from "@material-ui/core";
import { DateTimePickerProps } from "@material-ui/pickers";
import { Info as InfoIcon, Event as CalenderIcon } from "@material-ui/icons";
import {
	InputLabelConfig,
	UIInputProps,
	useInputStyles,
} from "../CommonStyles";
import { LocalizedDateTimePicker } from "../../../standalone/LocalizedDateTimePickers";

export interface DateTimeInputProps extends UIInputProps {
	openInfo?: () => void;
}

const DateTimeInput = (props: DateTimeInputProps & DateTimePickerProps) => {
	const { openInfo, important, ...muiProps } = props;
	const inputClasses = useInputStyles({ important });

	return (
		<LocalizedDateTimePicker
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
							<IconButton onClick={openInfo}>
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

export default React.memo(DateTimeInput);
