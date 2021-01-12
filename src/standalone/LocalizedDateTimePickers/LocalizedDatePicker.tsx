import React from "react";
import ccI18n from "../../i18n";
import { DatePicker, DatePickerProps } from "@material-ui/pickers";

type LocalizedDatePickerProps = Omit<
	DatePickerProps,
	| "invalidLabel"
	| "cancelLabel"
	| "clearLabel"
	| "okLabel"
	| "todayLabel"
	| "invalidDateMessage"
	| "minDateMessage"
	| "maxDateMessage"
	| "format"
	| "refuse"
	| "rifmFormatter"
>;

const LocalizedDatePicker = (props: LocalizedDatePickerProps) => (
	<DatePicker
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
		openTo="date"
		{...props}
	/>
);

export default React.memo(LocalizedDatePicker);
