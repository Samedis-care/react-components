import React from "react";
import { Typography } from "@mui/material";
import ModelRenderParams from "../../../RenderParams";
import ccI18n from "../../../../../i18n";
import getCurrentLocale from "../../../../../utils/getCurrentLocale";
import { DateTimeInput, FormHelperTextCC } from "../../../../../standalone";
import TypeDateTime from "../../TypeDateTime";
import moment from "moment";

/**
 * Renders a non-nullable Date with Date and Time Selector
 */
class RendererDateTime extends TypeDateTime {
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
					<DateTimeInput
						value={moment(value)}
						name={field}
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
							handleChange(field, date.toDate());
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
				{value.toLocaleString(getCurrentLocale(ccI18n))}
			</Typography>
		);
	}
}

export default RendererDateTime;
