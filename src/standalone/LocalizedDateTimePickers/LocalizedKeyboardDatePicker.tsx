import React from "react";
import i18n from "../../i18n";
import { useTranslation } from "react-i18next";
import TypeDate from "../../backend-integration/Model/Types/TypeDate";
import {
	KeyboardDatePicker,
	KeyboardDatePickerProps,
} from "@material-ui/pickers";
import { Event as CalendarIcon } from "@material-ui/icons";

export interface LocalizedKeyboardDatePickerProps
	extends Omit<
		KeyboardDatePickerProps,
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
	> {
	/**
	 * Boolean flag to hide Calendar Icon (only used if disabled is truthy)
	 */
	hideDisabledIcon?: boolean;
}

const LocalizedKeyboardDatePicker = (
	props: LocalizedKeyboardDatePickerProps
) => {
	const { t } = useTranslation(undefined, { i18n });
	return (
		<KeyboardDatePicker
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
			refuse={/([^0-9./-])/gi}
			rifmFormatter={TypeDate.format}
			keyboardIcon={
				props.hideDisabledIcon && props.disabled ? null : <CalendarIcon />
			}
			{...props}
		/>
	);
};

export default React.memo(LocalizedKeyboardDatePicker);
