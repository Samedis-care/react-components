import React from "react";
import ccI18n from "../../i18n";
import { DateTimePicker, DateTimePickerProps } from "@material-ui/pickers";

type LocalizedDateTimePickerProps = Omit<
	DateTimePickerProps,
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

const LocalizedDateTimePicker = (props: LocalizedDateTimePickerProps) => (
	<DateTimePicker
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
		format={"L LT"}
		openTo="date"
		{...props}
	/>
);

export default React.memo(LocalizedDateTimePicker);
