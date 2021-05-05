import React from "react";
import TypeDate from "../../backend-integration/Model/Types/TypeDate";
import {
	KeyboardDatePicker,
	KeyboardDatePickerProps,
} from "@material-ui/pickers";
import { Event as CalendarIcon } from "@material-ui/icons";
import { useTheme } from "@material-ui/core";
import useCCTranslations from "../../utils/useCCTranslations";

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
	const { hideDisabledIcon, ...otherProps } = props;
	const { t } = useCCTranslations();
	const theme = useTheme();
	const hideDisabledIcons =
		theme.componentsCare?.uiKit?.hideDisabledIcons ?? hideDisabledIcon;

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
				hideDisabledIcons && props.disabled ? null : <CalendarIcon />
			}
			{...otherProps}
		/>
	);
};

export default React.memo(LocalizedKeyboardDatePicker);
