import React from "react";
import { FormHelperText, Typography } from "@material-ui/core";
import { ModelRenderParams } from "../../index";
import TypeDateNullable from "../TypeDateNullable";
import { KeyboardDatePicker } from "@material-ui/pickers";
import ccI18n from "../../../../i18n";
import moment from "moment";

class RendererDateNullable extends TypeDateNullable {
	render(params: ModelRenderParams<Date | null>): React.ReactElement {
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
			return (
				<>
					<KeyboardDatePicker
						name={field}
						value={value}
						label={label}
						disabled={visibility.readOnly}
						onChange={(date) =>
							handleChange(field, date ? date.toDate() : null)
						}
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
				{label}:{" "}
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
