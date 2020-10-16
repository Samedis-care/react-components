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
class RendererBooleanCheckbox extends TypeBoolean {
	invert?: boolean;

	constructor(invert?: boolean) {
		super();

		this.invert = invert;
	}

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
			const control = (
				<Checkbox
					name={field}
					checked={this.invert ? !value : value}
					disabled={visibility.readOnly}
					onChange={(
						evt: React.ChangeEvent<HTMLInputElement>,
						checked: boolean
					) => {
						handleChange(evt.target.name, this.invert ? !checked : checked);
					}}
					onBlur={handleBlur}
				/>
			);

			return visibility.grid ? (
				control
			) : (
				<FormControl
					required={visibility.required}
					error={!!errorMsg}
					component={"fieldset"}
				>
					<FormControlLabel control={control} label={label} />
					<FormHelperText>{errorMsg}</FormHelperText>
				</FormControl>
			);
		}
		return (
			<Typography>
				{!visibility.grid && `${label}: `}
				{value
					? ccI18n.t("backend-integration.model.types.renderers.boolean.true")
					: ccI18n.t("backend-integration.model.types.renderers.boolean.false")}
			</Typography>
		);
	}
}

export default RendererBooleanCheckbox;
