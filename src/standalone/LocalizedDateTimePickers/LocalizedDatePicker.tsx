import React from "react";
import i18n from "../../i18n";
import { DatePicker, DatePickerProps } from "@material-ui/pickers";
import { useTranslation } from "react-i18next";

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

const LocalizedDatePicker = (props: LocalizedDatePickerProps) => {
	const { t } = useTranslation(undefined, { i18n });
	return (
		<DatePicker
			invalidLabel={t(
				"backend-integration.model.types.renderers.date.labels.invalid"
			)}
			cancelLabel={t(
				"backend-integration.model.types.renderers.date.labels.cancel"
			)}
			clearLabel={t(
				"backend-integration.model.types.renderers.date.labels.clear"
			)}
			okLabel={t("backend-integration.model.types.renderers.date.labels.ok")}
			todayLabel={t(
				"backend-integration.model.types.renderers.date.labels.today"
			)}
			invalidDateMessage={t(
				"backend-integration.model.types.renderers.date.labels.invalid-date"
			)}
			minDateMessage={t(
				"backend-integration.model.types.renderers.date.labels.min-date"
			)}
			maxDateMessage={t(
				"backend-integration.model.types.renderers.date.labels.max-date"
			)}
			format={"L"}
			openTo="date"
			{...props}
		/>
	);
};

export default React.memo(LocalizedDatePicker);
