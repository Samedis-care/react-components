import React from "react";
import {
	FormControl,
	FormControlLabel,
	FormHelperText,
	Switch,
	Typography,
} from "@material-ui/core";
import { ModelRenderParams } from "../../../index";
import TypeBoolean from "../../TypeBoolean";
import ccI18n from "../../../../../i18n";

/**
 * Renders a TypeBoolean field as Switch
 */
class RendererBooleanSwitch extends TypeBoolean {
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
			if (visibility.grid) throw new Error("Not supported");

			return (
				<FormControl
					required={visibility.required}
					error={!!errorMsg}
					component={"fieldset"}
				>
					<FormControlLabel
						control={
							<Switch
								name={field}
								checked={this.invert ? !value : value}
								disabled={visibility.readOnly}
								onChange={(
									evt: React.ChangeEvent<HTMLInputElement>,
									checked: boolean
								) => {
									handleChange(
										evt.target.name,
										this.invert ? !checked : checked
									);
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
				{!visibility.grid && `${label}: `}
				{value
					? ccI18n.t("backend-integration.model.types.renderers.boolean.true")
					: ccI18n.t("backend-integration.model.types.renderers.boolean.false")}
			</Typography>
		);
	}
}

export default RendererBooleanSwitch;
