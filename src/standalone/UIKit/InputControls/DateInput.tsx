import React from "react";
import { IconButton, InputAdornment, Tooltip } from "@material-ui/core";
import { DatePicker, DatePickerProps } from "@material-ui/pickers";
import { Info as InfoIcon, Event as CalenderIcon } from "@material-ui/icons";
import {
	InputLabelConfig,
	UIInputProps,
	useInputStyles,
} from "../CommonStyles";
import ccI18n from "../../../i18n";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";

export interface DateInputProps extends UIInputProps {
	infoText?: React.ReactNode;
}

const DateInput = (props: DateInputProps & DatePickerProps) => {
	const { onChange, infoText, important, ...muiProps } = props;
	const inputClasses = useInputStyles({ important });

	const handleChange = React.useCallback(
		(date: MaterialUiPickersDate) => {
			if (onChange) onChange(date);
		},
		[onChange]
	);

	return (
		<DatePicker
			{...muiProps}
			invalidLabel={ccI18n.t(
				"backend-integration.model.types.renderers.date.labels.invalid"
			)}
			cancelLabel={ccI18n.t(
				"backend-integration.model.types.renderers.date.labels.cancel"
			)}
			clearLabel={ccI18n.t(
				"backend-integration.model.types.renderers.date.labels.clear"
			)}
			okLabel={ccI18n.t(
				"backend-integration.model.types.renderers.date.labels.ok"
			)}
			todayLabel={ccI18n.t(
				"backend-integration.model.types.renderers.date.labels.today"
			)}
			invalidDateMessage={ccI18n.t(
				"backend-integration.model.types.renderers.date.labels.invalid-date"
			)}
			minDateMessage={ccI18n.t(
				"backend-integration.model.types.renderers.date.labels.min-date"
			)}
			maxDateMessage={ccI18n.t(
				"backend-integration.model.types.renderers.date.labels.max-date"
			)}
			format={"L"}
			onChange={handleChange}
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
