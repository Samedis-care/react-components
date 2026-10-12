import React from "react";
import { Typography } from "@mui/material";
import ModelRenderParams from "../../../RenderParams";
import TypeDate from "../../TypeDate";
import ccI18n from "../../../../../i18n";
import getCurrentLocale from "../../../../../utils/getCurrentLocale";
import { formatDateOnly } from "../../../../../utils/dateOnlyUtils";
import { DateInput, FormHelperTextCC } from "../../../../../standalone";
import { ToDateLocaleStringOptions } from "../../../../../constants";
import { IDataGridColumnDef } from "../../../../../standalone/DataGrid/DataGrid";
import { RendererDateNullableProps } from "./RendererDateNullable";

export type RendererDateProps = RendererDateNullableProps;

/**
 * Renders a non-nullable Date with Date Selector
 */
class RendererDate extends TypeDate {
	props?: RendererDateProps;

	constructor(props?: RendererDateProps) {
		super();

		this.props = props;
	}

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
			warningMsg,
			dirty,
			autoFocus,
			setFieldTouched,
		} = params;

		if (visibility.disabled) return <></>;
		if (visibility.hidden) {
			return (
				<input
					type="hidden"
					name={field}
					value={value.toISOString()}
					readOnly
					aria-hidden={"true"}
				/>
			);
		}
		if (visibility.editable) {
			if (visibility.grid) throw new Error("Not supported");

			return (
				<>
					<DateInput
						{...this.props}
						name={field}
						value={value}
						label={label}
						disabled={visibility.readOnly}
						required={visibility.required}
						onChange={(date) => {
							// The field can be emptied even though this type cannot hold null:
							// that is an invalid entry, so it surfaces as a validation error
							// and the model value stays.
							if (!date) {
								this.error = ccI18n.t(
									"backend-integration.model.types.renderers.date.validation-error",
								);
								setFieldTouched(field, touched, true);
								return;
							}
							this.error = "";
							handleChange(field, date);
						}}
						onBlur={handleBlur}
						error={!!errorMsg}
						warning={!!warningMsg}
						dirty={dirty}
						autoFocus={autoFocus}
						onError={(error: React.ReactNode) => {
							this.error = error
								? ccI18n.t(
										"backend-integration.model.types.renderers.date.validation-error",
									)
								: "";
							setFieldTouched(field, touched, true);
						}}
						fullWidth
					/>
					<FormHelperTextCC error={!!errorMsg} warning={!!warningMsg}>
						{errorMsg || warningMsg}
					</FormHelperTextCC>
				</>
			);
		}
		return (
			<Typography>
				{!visibility.grid && `${label}: `}
				{formatDateOnly(
					value,
					getCurrentLocale(ccI18n),
					ToDateLocaleStringOptions,
				)}
			</Typography>
		);
	}

	dataGridColumnSizingHint = (): IDataGridColumnDef["width"] => [
		0,
		Number.MAX_SAFE_INTEGER,
		10 * 10, // date length
	];
}

export default RendererDate;
