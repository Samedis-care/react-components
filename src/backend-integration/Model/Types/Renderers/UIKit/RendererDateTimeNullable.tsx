import React from "react";
import { FormHelperText, Typography } from "@material-ui/core";
import { ModelRenderParams } from "../../../index";
import TypeDateNullable from "../../TypeDateNullable";
import ccI18n from "../../../../../i18n";
import { DateTimeInput } from "../../../../../standalone";
import i18n from "../../../../../i18n";

/**
 * Renders Date with Date Selector
 */
class RendererDateTimeNullable extends TypeDateNullable {
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
					<DateTimeInput
						name={field}
						value={value}
						label={label}
						disabled={visibility.readOnly}
						required={visibility.required}
						onChange={(date) =>
							handleChange(field, date ? date.toDate() : null)
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
					? value.toLocaleString(i18n.language)
					: ccI18n.t("backend-integration.model.types.renderers.date.not-set")}
			</Typography>
		);
	}
}

export default RendererDateTimeNullable;
