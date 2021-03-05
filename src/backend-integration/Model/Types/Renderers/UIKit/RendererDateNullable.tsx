import React from "react";
import { FormHelperText, Typography } from "@material-ui/core";
import { ModelRenderParams } from "../../../index";
import TypeDateNullable from "../../TypeDateNullable";
import ccI18n from "../../../../../i18n";
import { normalizeDate } from "../../Utils/DateUtils";
import { DateInput } from "../../../../../standalone";
import i18n from "../../../../../i18n";
import { ToDateLocaleStringOptions } from "../../../../../constants";
import { DateInputProps } from "../../../../../standalone/UIKit/InputControls/DateInput";

export type RendererDateNullableProps = Omit<
	DateInputProps,
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
						onChange={(date) =>
							handleChange(field, date ? normalizeDate(date) : null)
						}
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
						clearable
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
}

export default RendererDateNullable;
