import React from "react";
import { FormHelperText, Typography } from "@material-ui/core";
import { ModelRenderParams } from "../../index";
import { KeyboardDatePicker } from "@material-ui/pickers";
import ccI18n from "../../../../i18n";
import { normalizeDate } from "../Utils/DateUtils";
import TypeDate from "../TypeDate";

/**
 * Renders Date with Date Selector
 */
class RendererDateNullable extends TypeDate {
	render(params: ModelRenderParams<Date>): React.ReactElement {
		const {
			visibility,
			field,
			value,
			label,
			handleChange,
			handleBlur,
			errorMsg,
		} = params;

		if (visibility.disabled) return <></>;
		if (visibility.hidden) {
			return (
				<input
					type="hidden"
					name={field}
					value={value ? value.toISOString() : ""}
					readOnly
					aria-hidden={"true"}
				/>
			);
		}
		if (visibility.editable) {
			if (visibility.grid) throw new Error("Not supported");

			return (
				<>
					<KeyboardDatePicker
						name={field}
						value={value}
						label={label}
						disabled={visibility.readOnly}
						onChange={(date) => {
							if (!date) throw new Error("Date is null");
							else handleChange(field, normalizeDate(date.toDate()));
						}}
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
						format={"L"}
						refuse={/([^0-9./-])/gi}
						rifmFormatter={(str) => str.replace(/([^0-9./-])/gm, "")}
						onBlur={handleBlur}
						error={!!errorMsg}
						fullWidth
					/>
					<FormHelperText error={!!errorMsg}>{errorMsg}</FormHelperText>
				</>
			);
		}
		return (
			<Typography>
				{!visibility.grid && `${label}: `}
				{value
					? value.toLocaleString()
					: ccI18n.t("backend-integration.model.types.renderers.date.not-set")}
			</Typography>
		);
	}
}

export default RendererDateNullable;
