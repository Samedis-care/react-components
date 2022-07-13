import React from "react";
import { FormHelperText, Typography } from "@material-ui/core";
import { ModelRenderParams } from "../../../index";
import ccI18n from "../../../../../i18n";
import { normalizeDate } from "../../Utils/DateUtils";
import TypeDate from "../../TypeDate";
import { LocalizedKeyboardDatePicker } from "../../../../../standalone/LocalizedDateTimePickers";
import i18n from "../../../../../i18n";
import { ToDateLocaleStringOptions } from "../../../../../constants";
import { IDataGridColumnDef } from "../../../../../standalone/DataGrid/DataGrid";

/**
 * Renders Date with Date Selector
 */
class RendererDate extends TypeDate {
	render(params: ModelRenderParams<Date>): React.ReactElement {
		const {
			visibility,
			field,
			value,
			touched,
			label,
			handleChange,
			handleBlur,
			errorMsg,
			setFieldTouched,
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
					<LocalizedKeyboardDatePicker
						name={field}
						value={value}
						label={label}
						disabled={visibility.readOnly}
						required={visibility.required}
						onChange={(date) => {
							if (!date) throw new Error("Date is null");
							else handleChange(field, normalizeDate(date.toDate()));
						}}
						onBlur={handleBlur}
						error={!!errorMsg}
						onError={(error: React.ReactNode) => {
							this.error = error
								? ccI18n.t(
										"backend-integration.model.types.renderers.date.validation-error"
								  )
								: "";
							setFieldTouched(field, touched, true);
						}}
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
					? value.toLocaleDateString(i18n.language, ToDateLocaleStringOptions)
					: ccI18n.t("backend-integration.model.types.renderers.date.not-set")}
			</Typography>
		);
	}

	dataGridColumnSizingHint = (): IDataGridColumnDef["width"] => {
		const def =
			Math.max(
				ccI18n.t("backend-integration.model.types.renderers.date.not-set")
					.length,
				10 // date length
			) * 10;
		return [0, Number.MAX_SAFE_INTEGER, def];
	};
}

export default RendererDate;
