import React from "react";
import { Typography } from "@material-ui/core";
import { ModelRenderParams } from "../../../index";
import TypeDateNullable from "../../TypeDateNullable";
import ccI18n from "../../../../../i18n";
import { normalizeDate } from "../../Utils/DateUtils";
import { DateInput, FormHelperTextCC } from "../../../../../standalone";
import i18n from "../../../../../i18n";
import { ToDateLocaleStringOptions } from "../../../../../constants";
import { IDataGridColumnDef } from "../../../../../standalone/DataGrid/DataGrid";

export type RendererDateNullableProps = Omit<
	Parameters<typeof DateInput>[0],
	| "name"
	| "value"
	| "label"
	| "disabled"
	| "onChange"
	| "onBlur"
	| "error"
	| "onError"
	| "fullWidth"
	| "clearable"
>;

/**
 * Renders Date with Date Selector
 */
class RendererDateNullable extends TypeDateNullable {
	props?: RendererDateNullableProps;

	constructor(props?: RendererDateNullableProps) {
		super();

		this.props = props;
	}

	render(params: ModelRenderParams<Date | null>): React.ReactElement {
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
					<DateInput
						{...this.props}
						name={field}
						value={value}
						label={label}
						disabled={visibility.readOnly}
						required={visibility.required}
						onChange={(date) =>
							handleChange(field, date ? normalizeDate(date) : null)
						}
						onBlur={handleBlur}
						error={!!errorMsg}
						warning={!!warningMsg}
						onError={(error: React.ReactNode) => {
							this.error = error
								? ccI18n.t(
										"backend-integration.model.types.renderers.date.validation-error"
								  )
								: "";
							setFieldTouched(field, touched, true);
						}}
						fullWidth
						clearable
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

export default RendererDateNullable;
