import React from "react";
import {
	Checkbox,
	FormControl,
	FormControlLabel,
	FormHelperText,
	Typography,
} from "@material-ui/core";
import { ModelRenderParams } from "../../index";
import TypeBoolean from "../TypeBoolean";
import ccI18n from "../../../../i18n";

/**
 * Renders a TypeBoolean field as Checkbox
 */
class RendererBoolean extends TypeBoolean {
	render(params: ModelRenderParams<boolean>): React.ReactElement {
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
					checked={value}
					readOnly
					aria-hidden={"true"}
				/>
			);
		}
		if (visibility.editable) {
			return (
				<FormControl
					required={visibility.required}
					error={!!errorMsg}
					component={"fieldset"}
				>
					<FormControlLabel
						control={
							<Checkbox
								name={field}
								checked={value}
								disabled={visibility.readOnly}
								onChange={(
									evt: React.ChangeEvent<HTMLInputElement>,
									checked: boolean
								) => {
									handleChange(evt.target.name, checked);
								}}
								onBlur={handleBlur}
							/>
						}
						label={label}
					/>
					<FormHelperText>{errorMsg}</FormHelperText>
				</FormControl>
			);
		}
		return (
			<Typography>
				{label}:{" "}
				{value
					? ccI18n.t("backend-integration.model.types.renderers.boolean.true")
					: ccI18n.t("backend-integration.model.types.renderers.boolean.false")}
			</Typography>
		);
	}
}

export default RendererBoolean;
