import React from "react";
import { FormHelperText, Typography } from "@material-ui/core";
import { ModelRenderParams } from "../../index";
import { KeyboardDatePicker } from "@material-ui/pickers";
import ccI18n from "../../../../i18n";
import moment from "moment";
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
						onBlur={handleBlur}
						error={!!errorMsg}
						format={moment.localeData().longDateFormat("L")}
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
					: ccI18n.t(
							"backend-integration.model.types.renderers.date-nullable.not-set"
					  )}
			</Typography>
		);
	}
}

export default RendererDateNullable;
